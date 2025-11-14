export function getStyles(isDarkMode) {
    const bgPage = isDarkMode ? "#020617" : "#f9fafb";
    const bgCard = isDarkMode ? "#020617" : "#ffffff";
    const borderColor = isDarkMode ? "#1f2937" : "#e5e7eb";
    const textColor = isDarkMode ? "#e5e7eb" : "#111827";
    const subTextColor = isDarkMode ? "#9ca3af" : "#6b7280";
    const codeBg = isDarkMode ? "#020617" : "#f3f4f6";

    const MAX_WIDTH = 980; // shared by header + main card

    return {
        page: {
            fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: bgPage,
            minHeight: "100vh",
            color: textColor,
        },

        /* -------- HEADER (centered block, left-aligned text) -------- */
        header: {
            position: "sticky",
            top: 0,
            zIndex: 20,
            borderBottom: `1px solid ${borderColor}`,
            backdropFilter: "blur(10px)",
            background: isDarkMode
                ? "rgba(2,6,23,0.95)"
                : "rgba(249,250,251,0.96)",
            width: "100%",
        },

        headerInner: {
            maxWidth: MAX_WIDTH,
            margin: "0 auto",
            padding: "14px 24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            textAlign: "left",
            gap: 4,
        },

        headerTopRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
            width: "100%",
        },

        badge: {
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 8px",
            borderRadius: 999,
            border: `1px solid ${borderColor}`,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            fontWeight: 600,
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
            padding: "1px 4px",
            borderRadius: 999,
            background: isDarkMode ? "#1e293b" : "#eef2ff",
            fontSize: 9,
            fontWeight: 500,
        },

        headerTitle: {
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.2,
        },

        headerSubtitle: {
            margin: 0,
            marginTop: 4,
            fontSize: 13,
            lineHeight: 1.35,
            maxWidth: 720,
            color: subTextColor,
        },

        // move the theme hint lower using relative positioning
        headerThemeHint: {
            fontSize: 12,
            color: subTextColor,
            whiteSpace: "nowrap",
            position: "relative",
            top: 8,        // push it down
            marginRight: 4,
        },

        /* ---------------- MAIN LAYOUT ---------------- */
        main: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "28px 16px 48px",
        },

        // main card with two columns
        card: {
            maxWidth: MAX_WIDTH,
            width: "100%",
            margin: "0 auto",
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

        // offset entire tips column so the top aligns with the Job Title label
        tipsColumn: {
            flex: 2,
            minWidth: 240,
            marginTop: 28,   // play with 24–32 if you want finer tuning
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