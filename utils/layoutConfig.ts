// 统一的页面布局配置
export const LAYOUT_CONFIG = {
  // 统一的容器宽度 - 适合Web和手机
  container: {
    maxWidth: 600, // 比原来更宽，但不会太宽
    width: "95vw", // 响应式宽度
    minWidth: 320, // 最小宽度，确保手机显示正常
  },
  
  // 统一的字体大小
  fontSize: {
    h1: 32,        // 主标题 (原28-32)
    h2: 24,        // 副标题 (原18-22)
    h3: 20,        // 小标题 (原16-18)
    body: 16,      // 正文 (原14-16)
    small: 14,     // 小文字 (原12-14)
    caption: 12,   // 说明文字 (原10-12)
  },
  
  // 统一的间距
  spacing: {
    container: "24px",     // 容器内边距
    section: "20px",       // 区块间距
    element: "16px",       // 元素间距
    small: "12px",         // 小间距
  },
  
  // 统一的圆角
  borderRadius: {
    container: 28,         // 主容器圆角
    card: 20,             // 卡片圆角
    button: 12,           // 按钮圆角
    small: 8,             // 小圆角
  },
  
  // 统一的阴影
  boxShadow: {
    main: "0 8px 32px 0 rgba(31,38,135,0.37)",
    card: "0 4px 16px 0 rgba(31,38,135,0.25)",
    button: "0 2px 8px 0 rgba(79,195,247,0.15)",
  },
  
  // 统一的背景
  background: {
    page: "radial-gradient(ellipse at 60% 20%, #232b4d 0%, #0c0c0c 100%)",
    container: "rgba(30,34,54,0.92)",
    card: "rgba(44,52,80,0.95)",
    overlay: "rgba(0,0,0,0.9)",
  },
  
  // 统一的边框
  border: {
    main: "1.5px solid rgba(255,255,255,0.08)",
    light: "1px solid rgba(255,255,255,0.05)",
    accent: "1px solid rgba(79,195,247,0.3)",
  },
  
  // 统一的颜色
  colors: {
    primary: "#4fc3f7",
    secondary: "#7b61ff", 
    accent: "#ffc107",
    text: "#ffffff",
    textMuted: "#b0b8d0",
    textDim: "#808aa3",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
  }
};

// 通用页面容器样式
export const getPageContainerStyle = (): React.CSSProperties => ({
  minHeight: "100vh",
  background: LAYOUT_CONFIG.background.page,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  color: LAYOUT_CONFIG.colors.text,
  padding: `${LAYOUT_CONFIG.spacing.container} 0`,
});

// 通用主容器样式
export const getMainContainerStyle = (customMaxWidth?: number): React.CSSProperties => ({
  background: LAYOUT_CONFIG.background.container,
  borderRadius: LAYOUT_CONFIG.borderRadius.container,
  boxShadow: LAYOUT_CONFIG.boxShadow.main,
  padding: LAYOUT_CONFIG.spacing.container,
  maxWidth: customMaxWidth || LAYOUT_CONFIG.container.maxWidth,
  width: LAYOUT_CONFIG.container.width,
  minWidth: LAYOUT_CONFIG.container.minWidth,
  border: LAYOUT_CONFIG.border.main,
  backdropFilter: "blur(8px)",
  display: "flex",
  flexDirection: "column",
  margin: `${LAYOUT_CONFIG.spacing.section} 0`,
});

// 通用卡片样式
export const getCardStyle = (): React.CSSProperties => ({
  background: LAYOUT_CONFIG.background.card,
  borderRadius: LAYOUT_CONFIG.borderRadius.card,
  boxShadow: LAYOUT_CONFIG.boxShadow.card,
  padding: LAYOUT_CONFIG.spacing.element,
  border: LAYOUT_CONFIG.border.light,
  backdropFilter: "blur(4px)",
});

// 通用按钮样式
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'accent' = 'primary'): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: `${LAYOUT_CONFIG.spacing.small} ${LAYOUT_CONFIG.spacing.element}`,
    border: "none",
    borderRadius: LAYOUT_CONFIG.borderRadius.button,
    color: LAYOUT_CONFIG.colors.text,
    fontWeight: 600,
    fontSize: LAYOUT_CONFIG.fontSize.body,
    cursor: "pointer",
    boxShadow: LAYOUT_CONFIG.boxShadow.button,
    transition: "all 0.2s ease",
  };
  
  const variants = {
    primary: {
      background: `linear-gradient(90deg, ${LAYOUT_CONFIG.colors.primary} 0%, ${LAYOUT_CONFIG.colors.secondary} 100%)`,
    },
    secondary: {
      background: "rgba(255,255,255,0.1)",
      border: LAYOUT_CONFIG.border.light,
    },
    accent: {
      background: `rgba(${LAYOUT_CONFIG.colors.accent}, 0.2)`,
      border: `1px solid rgba(${LAYOUT_CONFIG.colors.accent}, 0.3)`,
    }
  };
  
  return { ...baseStyle, ...variants[variant] };
};

// 响应式字体大小辅助函数
export const getResponsiveFontSize = (baseSize: number): string => {
  return `clamp(${Math.max(baseSize - 4, 12)}px, ${baseSize}px, ${baseSize + 2}px)`;
};

// 模态框样式
export const getModalStyle = (): React.CSSProperties => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: LAYOUT_CONFIG.background.overlay,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: `${LAYOUT_CONFIG.spacing.container} 0`,
});

// 标题样式
export const getTitleStyle = (level: 'h1' | 'h2' | 'h3' = 'h1'): React.CSSProperties => ({
  fontSize: LAYOUT_CONFIG.fontSize[level],
  fontWeight: level === 'h1' ? 800 : level === 'h2' ? 700 : 600,
  marginBottom: LAYOUT_CONFIG.spacing.element,
  letterSpacing: level === 'h1' ? '1px' : '0.5px',
  color: LAYOUT_CONFIG.colors.text,
});