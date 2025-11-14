export function getStyles(isDarkMode) {
    const bgPage = isDarkMode ? "#020617" : "#f9fafb";
    const bgCard = isDarkMode ? "#020617" : "#ffffff";
    const borderColor = isDarkMode ? "#1f2937" : "#e5e7eb";
    const textColor = isDarkMode ? "#e5e7eb" : "#111827";
    const subTextColor = isDarkMode ? "#9ca3af" : "#6b7280";
    const codeBg = isDarkMode ? "#020617" : "#f3f4f6";

    return {
        page: {
            fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: bgPage,
            minHeight: "100vh",
            color: textColor,
        },

        header: {
            padding: "20px 24px",
            borderBottom: `1px solid ${borderColor}`,
            background: bgCard,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            position: "sticky",
            top: 0,
            zIndex: 10,
        },

        main: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "32px 16px 48px",
        },

        // main card with two columns
        card: {
            maxWidth: 980,
            width: "100%",
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

        h2: { marginBottom: 8, fontSize: 20 },
        formIntro: {
            margin: "0 0 16px",
            fontSize: 13,
            color: subTextColor,
        },

        label: {
            display: "block",
            fontSize: 13,
            marginTop: 8,
            marginBottom: 4,
            color: subTextColor,
        },

        input: {
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${borderColor}`,
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 10,
            fontSize: 14,
            background: isDarkMode ? "#020617" : "#ffffff",
            color: textColor,
            outline: "none",
        },

        textarea: {
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${borderColor}`,
            borderRadius: 10,
            padding: "10px 12px",
            minHeight: 140,
            resize: "vertical",
            fontFamily: "inherit",
            fontSize: 14,
            marginBottom: 10,
            background: isDarkMode ? "#020617" : "#ffffff",
            color: textColor,
            outline: "none",
        },

        fileInput: {
            width: "100%",
            marginBottom: 6,
            fontSize: 13,
            color: textColor,
        },

        fileMeta: {
            fontSize: 12,
            color: subTextColor,
            marginBottom: 8,
        },

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

        error: {
            background: isDarkMode ? "#450a0a" : "#fef2f2",
            color: isDarkMode ? "#fecaca" : "#991b1b",
            border: `1px solid ${isDarkMode ? "#7f1d1d" : "#fecaca"}`,
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
            fontSize: 13,
        },

        // header extras
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

        // tips
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

        // keep your existing code styles etc
        pre: {
            background: codeBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
            maxHeight: 400,
            overflow: "auto",
            whiteSpace: "pre-wrap",
        },
    };
}