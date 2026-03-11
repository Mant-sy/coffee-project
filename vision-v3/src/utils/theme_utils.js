export const getThemeValue = (theme) => {
  return theme === 'dark' ? {
    logoSrc: 'logo_dark.png',
    headerBorderSrc: 'header_border_dark.png',
    themeSrc: 'qiehuan_dark.png',
    backgroundColor: '#161522',
    titleColor: '#fff',
    moduleBg: 'rgba(0, 0, 0, 0.1)',
    moduleBorder: 'rgba(76, 155, 253, 0.3)',
    moduleShadow: 'rgba(0, 0, 0, 0.1)',
    chartBg: 'rgba(76, 155, 253, 0.05)',
    axisColor: '#4c9bfd',
    textColor: '#fff',
    splitColor: 'rgba(255, 255, 255, 0.1)',
    primaryColor: '#4c9bfd',
    secondaryColor: '#91cc75',
    gradientStart: 'rgba(76, 155, 253, 0.5)',
    gradientEnd: 'rgba(76, 155, 253, 0.1)'
  } : {
    logoSrc: 'logo_light2.png',
    headerBorderSrc: 'header_border_light.png',
    themeSrc: 'qiehuan_light.png',
    backgroundColor: '#f0f2f5',
    titleColor: '#333',
    moduleBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    moduleBorder: 'rgba(76, 155, 253, 0.2)',
    moduleShadow: 'rgba(76, 155, 253, 0.15)',
    chartBg: 'rgba(76, 155, 253, 0.03)',
    axisColor: '#4c9bfd',
    textColor: '#333',
    splitColor: 'rgba(76, 155, 253, 0.1)',
    primaryColor: '#4c9bfd',
    secondaryColor: '#67c23a',
    gradientStart: 'rgba(76, 155, 253, 0.3)',
    gradientEnd: 'rgba(76, 155, 253, 0.05)'
  }
}
