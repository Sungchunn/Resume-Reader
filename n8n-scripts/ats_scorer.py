"""
ATS Score Calculator
Analyzes resume for ATS compatibility and calculates a score out of 100

Use this in n8n Code node (JavaScript or Python)
"""

import re
from typing import Dict, List, Any


def calculate_ats_score(
    resume_text: str,
    target_roles: str,
    analysis_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Calculate ATS score based on multiple factors

    Args:
        resume_text: The full text of the resume
        target_roles: Comma-separated target job roles
        analysis_data: Optional gap analysis from OpenAI

    Returns:
        Dictionary with score and breakdown
    """
    score_breakdown = {}
    total_score = 0

    # 1. Structure Score (25 points)
    structure_score = calculate_structure_score(resume_text)
    score_breakdown['structure'] = structure_score
    total_score += structure_score

    # 2. Keyword Score (30 points)
    keyword_score = calculate_keyword_score(resume_text, target_roles, analysis_data)
    score_breakdown['keywords'] = keyword_score
    total_score += keyword_score

    # 3. Formatting Score (20 points)
    formatting_score = calculate_formatting_score(resume_text)
    score_breakdown['formatting'] = formatting_score
    total_score += formatting_score

    # 4. Content Quality Score (25 points)
    content_score = calculate_content_score(resume_text)
    score_breakdown['content_quality'] = content_score
    total_score += content_score

    return {
        'ats_score': round(total_score),
        'breakdown': score_breakdown,
        'grade': get_grade(total_score),
        'recommendations': generate_recommendations(score_breakdown)
    }


def calculate_structure_score(text: str) -> float:
    """Score based on resume structure (max 25 points)"""
    score = 0
    text_lower = text.lower()

    # Check for essential sections (5 points each)
    sections = {
        'summary': ['summary', 'objective', 'profile', 'about'],
        'experience': ['experience', 'employment', 'work history'],
        'education': ['education', 'academic'],
        'skills': ['skills', 'competencies', 'technical skills'],
    }

    for section_name, keywords in sections.items():
        if any(keyword in text_lower for keyword in keywords):
            score += 6.25  # 25 / 4 sections

    return score


def calculate_keyword_score(text: str, target_roles: str, analysis_data: Dict = None) -> float:
    """Score based on relevant keywords (max 30 points)"""
    score = 0
    text_lower = text.lower()

    # Common high-value keywords (adjust based on target role)
    high_value_keywords = [
        'led', 'developed', 'managed', 'implemented', 'increased',
        'reduced', 'improved', 'achieved', 'delivered', 'created'
    ]

    # Count action verbs (up to 15 points)
    action_verb_count = sum(1 for keyword in high_value_keywords if keyword in text_lower)
    score += min(15, action_verb_count * 2)

    # If we have analysis data with missing keywords, penalize
    if analysis_data and 'missing_keywords' in analysis_data:
        missing_count = len(analysis_data['missing_keywords'])
        penalty = min(15, missing_count * 3)
        score += max(0, 15 - penalty)
    else:
        score += 15  # Give benefit of doubt if no analysis

    return score


def calculate_formatting_score(text: str) -> float:
    """Score based on ATS-friendly formatting (max 20 points)"""
    score = 0

    # Check for bullet points (5 points)
    if re.search(r'[-•*]\s', text):
        score += 5

    # Check for dates (5 points)
    date_patterns = [
        r'\b(19|20)\d{2}\b',  # Year
        r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b',  # Month Year
    ]
    if any(re.search(pattern, text) for pattern in date_patterns):
        score += 5

    # Check for quantifiable results (10 points)
    quantifiable_patterns = [
        r'\d+%',  # Percentages
        r'\$\d+',  # Dollar amounts
        r'\d+\+',  # Numbers with plus
        r'\d+k',  # Thousands
    ]
    quant_matches = sum(1 for pattern in quantifiable_patterns if re.search(pattern, text))
    score += min(10, quant_matches * 3)

    return score


def calculate_content_score(text: str) -> float:
    """Score based on content quality (max 25 points)"""
    score = 0

    # Length check (5 points) - ideal resume is 400-800 words
    word_count = len(text.split())
    if 400 <= word_count <= 1200:
        score += 5
    elif 300 <= word_count <= 1500:
        score += 3
    else:
        score += 1

    # Check for specific achievements (10 points)
    achievement_keywords = [
        'increased', 'decreased', 'improved', 'reduced', 'saved',
        'generated', 'grew', 'exceeded', 'achieved', 'won'
    ]
    achievement_count = sum(1 for keyword in achievement_keywords if keyword in text.lower())
    score += min(10, achievement_count * 2)

    # Check for technical/specific terms (10 points)
    # This is a simple check - ideally would be role-specific
    has_specific_terms = len(re.findall(r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b', text)) > 5  # CamelCase words (e.g., JavaScript, PowerPoint)
    if has_specific_terms:
        score += 10
    else:
        score += 5

    return score


def get_grade(score: float) -> str:
    """Convert score to letter grade"""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"


def generate_recommendations(breakdown: Dict[str, float]) -> List[str]:
    """Generate improvement recommendations based on score breakdown"""
    recommendations = []

    if breakdown['structure'] < 20:
        recommendations.append("Add clear section headers: Summary, Experience, Education, Skills")

    if breakdown['keywords'] < 20:
        recommendations.append("Include more action verbs (Led, Developed, Implemented) and industry keywords")

    if breakdown['formatting'] < 15:
        recommendations.append("Add bullet points and quantifiable results (percentages, numbers, metrics)")

    if breakdown['content_quality'] < 20:
        recommendations.append("Expand on achievements with specific examples and outcomes")

    if not recommendations:
        recommendations.append("Great job! Focus on tailoring content to specific job descriptions")

    return recommendations


# ===== n8n Code Node Usage =====
"""
In n8n Code Node (Python):

# Get data from previous nodes
resume_text = $json.resume_text
target_roles = $json.target_roles
analysis_data = $json.gap_analysis  # Optional, from OpenAI analysis

# Calculate ATS score
result = calculate_ats_score(resume_text, target_roles, analysis_data)

# Return for next node
return [{
    'json': {
        'ats_score': result['ats_score'],
        'grade': result['grade'],
        'score_breakdown': result['breakdown'],
        'recommendations': result['recommendations']
    }
}]
"""


# ===== JavaScript Version for n8n =====
"""
// n8n Code Node (JavaScript) - Simplified version

function calculateATSScore(resumeText, targetRoles) {
  let score = 0;
  const text = resumeText.toLowerCase();

  // Structure (25 points)
  const sections = ['summary', 'experience', 'education', 'skills'];
  sections.forEach(section => {
    if (text.includes(section)) score += 6.25;
  });

  // Keywords (30 points)
  const actionVerbs = ['led', 'developed', 'managed', 'implemented', 'increased'];
  const verbCount = actionVerbs.filter(v => text.includes(v)).length;
  score += Math.min(15, verbCount * 3);

  // Formatting (20 points)
  if (/[-•*]\s/.test(resumeText)) score += 5;
  if (/\d+%|\$\d+/.test(resumeText)) score += 15;

  // Content (25 points)
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount >= 400 && wordCount <= 1200) score += 25;
  else if (wordCount >= 300 && wordCount <= 1500) score += 15;
  else score += 5;

  return Math.round(score);
}

// Use in n8n:
const atsScore = calculateATSScore($json.resume_text, $json.target_roles);
return [{ json: { ats_score: atsScore } }];
"""
