// api/upload.js

const WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.error("❌ Missing REACT_APP_N8N_WEBHOOK_URL in .env");
}

export async function uploadJob({ roleName, jobDescription, file }) {
    const form = new FormData();
    form.append("role_name", roleName);
    form.append("job_description", jobDescription);
    form.append("resume", file);

    const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
    }

    return res.json();
}