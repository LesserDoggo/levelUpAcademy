import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const logoSvg = `<svg fill="none" height="100%" width="100%" viewBox="0 0 512 512" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1,0,0,1,164.35,209.381)" visibility="hidden" id="i0"><animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="4s" values="hidden; visible; visible" keyTimes="0; 0.021; 1" attributeName="visibility" /><text fill="#ffffff" dominant-baseline="middle" text-anchor="start" font-size="50" font-family="Cal Sans Regular, Arial, sans-serif">LevelUp</text></g><g transform="matrix(1,0,0,1,145.325,259.351)" visibility="hidden" id="i1"><animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="4s" values="hidden; visible; visible" keyTimes="0; 0.021; 1" attributeName="visibility" /><text fill="#9944ff" dominant-baseline="middle" text-anchor="start" font-size="50" font-family="Cal Sans Regular, Arial, sans-serif">Academy</text></g><g visibility="hidden" id="i2"><animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="4s" values="hidden; visible; visible" keyTimes="0; 0.025; 1" attributeName="visibility" /><g transform="translate(309.8,178.5)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="4s" begin="0s" calcMode="spline" values="309.8 178.5; 309.8 178.5; 309.8 172.5; 309.8 176.5; 309.8 172.5; 309.8 172.5" keyTimes="0; 0.025; 0.095833; 0.145833; 0.191667; 1" keySplines="0 0 1 1; 0.55 0.06 0.36 1; 0.65 0 0.36 1; 0.65 0 0.36 1; 0 0 1 1" fill="freeze" /><g transform="scale(1.021,1)"><animateTransform repeatCount="indefinite" type="scale" attributeName="transform" dur="4s" begin="0s" calcMode="spline" values="1.021 1; 1.021 1; 1.4 1.75; 2 1.75; 2 1.75" keyTimes="0; 0.025; 0.095833; 0.145833; 1" keySplines="0 0 1 1; 0.55 0.06 1 1; 0 0 1 1; 0 0 1 1" fill="freeze" /><g transform="translate(0,0)"><path d="M0,-4.131C0,-4.131,3.577,2.065,3.577,2.065C3.577,2.065,-3.577,2.065,-3.577,2.065C-3.577,2.065,0,-4.131,0,-4.131Z" fill="#ffffff" /></g></g></g></g><g opacity="0" visibility="visible" id="i3"><animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="4s" values="visible; hidden; hidden" keyTimes="0; 0.9; 1" attributeName="visibility" /><animate repeatCount="indefinite" attributeName="opacity" dur="4s" begin="0s" fill="freeze" values="0; 0; 0.75; 0; 0" keyTimes="0; 0.104167; 0.208333; 0.354167; 1" keySplines="0 0 1 1; 0.55 0.06 0.68 0.19; 0.55 0.06 1 1; 0 0 1 1" calcMode="spline" /><g transform="translate(392.7,268.5)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="4s" begin="0s" calcMode="spline" values="392.7 268.5; 392.7 268.5; 392.7 239.5; 392.7 200.5; 392.7 200.5" keyTimes="0; 0.104167; 0.208334; 0.354167; 1" keySplines="0 0 1 1; 0.55 0.06 0.68 0.19; 0.55 0.06 1 1; 0 0 1 1" fill="freeze" /><g transform="rotate(270) scale(1.5,1.5) translate(-13.8,15.5)"><text fill="#dddddd" dominant-baseline="middle" text-anchor="start" font-size="50" font-family="Cal Sans Regular, Arial, sans-serif">&gt;</text></g></g></g><g opacity="0" visibility="visible" id="i4"><animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="4s" values="visible; hidden; hidden" keyTimes="0; 0.9; 1" attributeName="visibility" /><animate repeatCount="indefinite" attributeName="opacity" dur="4s" begin="0s" fill="freeze" values="0; 0; 0.75; 0; 0" keyTimes="0; 0.104167; 0.208333; 0.354167; 1" keySplines="0 0 1 1; 0.55 0.06 0.68 0.19; 0.55 0.06 1 1; 0 0 1 1" calcMode="spline" /><g transform="translate(392.7,228.5)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="4s" begin="0s" calcMode="spline" values="392.7 228.5; 392.7 228.5; 392.7 199.5; 392.7 160.5; 392.7 160.5" keyTimes="0; 0.104167; 0.208334; 0.354167; 1" keySplines="0 0 1 1; 0.55 0.06 0.68 0.19; 0.55 0.06 1 1; 0 0 1 1" fill="freeze" /><g transform="rotate(270) scale(1.5,1.5) translate(-13.8,15.5)"><text fill="#dddddd" dominant-baseline="middle" text-anchor="start" font-size="50" font-family="Cal Sans Regular, Arial, sans-serif">&gt;</text></g></g></g><g opacity="0" visibility="visible" id="i5"><animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="4s" values="visible; hidden; hidden" keyTimes="0; 0.9; 1" attributeName="visibility" /><animate repeatCount="indefinite" attributeName="opacity" dur="4s" begin="0s" fill="freeze" values="0; 0; 1; 0; 0" keyTimes="0; 0.104167; 0.208333; 0.354167; 1" keySplines="0 0 1 1; 0.55 0.06 0.68 0.19; 0.55 0.06 1 1; 0 0 1 1" calcMode="spline" /><g transform="translate(392.705,248.5)"><animateTransform repeatCount="indefinite" type="translate" attributeName="transform" dur="4s" begin="0s" calcMode="spline" values="392.705 248.5; 392.705 248.5; 392.705 219.5; 392.705 180.5; 392.705 180.5" keyTimes="0; 0.104167; 0.208334; 0.354167; 1" keySplines="0 0 1 1; 0.55 0.06 0.68 0.19; 0.55 0.06 1 1; 0 0 1 1" fill="freeze" /><g transform="rotate(270) scale(1.5,1.5) translate(-13.8,15.5)"><text fill="#dddddd" dominant-baseline="middle" text-anchor="start" font-size="50" font-family="Cal Sans Regular, Arial, sans-serif">&gt;</text></g></g></g></svg>`;

const logoHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{height:100%;margin:0;background:transparent;overflow:hidden;}body{display:flex;align-items:center;justify-content:center;}svg{display:block;width:100%;height:100%;}</style></head><body>${logoSvg}</body></html>`;

const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  border: 0,
  backgroundColor: 'transparent',
};

export default function SplashLogo() {
  if (Platform.OS === 'web') {
    return React.createElement('iframe', {
      srcDoc: logoHtml,
      title: 'LevelUp Academy',
      style: iframeStyle,
    });
  }

  return (
    <View style={styles.nativeWrapper} pointerEvents="none">
      <WebView
        androidLayerType="software"
        originWhitelist={['*']}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        source={{ html: logoHtml }}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
