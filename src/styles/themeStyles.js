// styles/themeStyles.js
export function getStyles(isDarkMode) {
    const bgPage = isDarkMode ? "#020617" : "#f9fafb";
    const bgCard = isDarkMode ? "#020617" : "#ffffff";
    const borderColor = isDarkMode ? "#1f2937" : "#e5e7eb";
    const textColor = isDarkMode ? "#e5e7eb" : "#111827";
    const subTextColor = isDarkMode ? "#9ca3af" : "#6b7280";
    const codeBg = isDarkMode ? "#020617" : "#f3f4f6";

    return {
// layout
        main: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "32px 16px 48px",
        },

        cardShell: {
            maxWidth: 980,
            width: "100%",
        },

        cardInner: {
            background: bgCard,
            border: `1px solid ${borderColor}`,
            borderRadius: 24,
            padding: 24,
            display: "flex",
            gap: 24,
            boxShadow: isDarkMode
                ? "0 22px 60px rgba(15,23,42,0.85)"
                : "0 22px 60px rgba(15,23,42,0.12)",
        },

        formColumn: {
            flex: 3,
            minWidth: 0,
        },

        tipsColumn: {
            flex: 2,
            minWidth: 220,
        },

// header
        headerTopRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
        },

        badge: {
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            border: `1px solid ${borderColor}`,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.06,
        },

        badgeDot: {
            width: 6,
            height: 6,
            borderRadius: "999px",
            background: "#4f46e5",
        },

        badgeText: {
            fontWeight: 600,
        },

        badgeTag: {
            padding: "2px 6px",
            borderRadius: 999,
            background: isDarkMode ? "#020617" : "#eef2ff",
            fontSize: 10,
            fontWeight: 500,
        },

        headerTitle: {
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
        },

        headerSubtitle: {
            marginTop: 4,
            fontSize: 14,
            color: subTextColor,
        },

        headerThemeHint: {
            fontSize: 12,
            color: subTextColor,
        },

// form intro
        formIntro: {
            margin: "0 0 16px",
            fontSize: 13,
            color: subTextColor,
        },

// primary button
        primaryButton: {
            marginTop: 8,
            width: "100%",
            border: "none",
            borderRadius: 999,
            padding: "10px 16px",
            fontWeight: 600,
            fontSize: 14,
            color: "#ffffff",
            background:
                "linear-gradient(90deg, #4f46e5 0%, #6366f1 40%, #0ea5e9 100%)",
            boxShadow: "0 12px 30px rgba(79,70,229,0.45)",
        },

// tips card
        tipsCard: {
            borderRadius: 18,
            border: `1px dashed ${borderColor}`,
            padding: 16,
            background: isDarkMode ? "#020617" : "#f9fafb",
            fontSize: 13,
        },

        tipsTitle: {
            marginTop: 0,
            marginBottom: 8,
            fontSize: 14,
            fontWeight: 600,
        },

        tipsList: {
            margin: "0 0 12px",
            paddingLeft: 18,
            color: subTextColor,
        },

        tipsSubCard: {
            marginTop: 6,
            padding: 10,
            borderRadius: 12,
            background: isDarkMode ? "#020617" : "#eef2ff",
        },

        tipsSubTitle: {
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
        },

        tipsSubText: {
            fontSize: 12,
            margin: 0,
            color: subTextColor,
        },
    };
}