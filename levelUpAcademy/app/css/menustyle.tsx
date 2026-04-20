import { ViewStyle } from 'react-native';

export const menuStyle = (
    isDesktop: boolean,
    screenHeight: number
): ViewStyle => ({
    backgroundColor: "#2f2146",
    position: "absolute",

    // Mobile
    bottom: isDesktop ? undefined : 0,
    left: 0,
    right: isDesktop ? undefined : 0,

    // Desktop
    top: isDesktop ? 0 : undefined,

    height: isDesktop ? '100%' : 100,
    maxHeight: isDesktop ? undefined : 130,
    width: isDesktop ? 90 : "100%",

    flexDirection: isDesktop ? "column" : "row",
    justifyContent: "space-evenly",
    alignItems: "center",

    paddingBottom: isDesktop ? 0 : 15,
    paddingVertical: isDesktop ? 30 : 0,
    paddingHorizontal: 20,

    borderTopWidth: isDesktop ? 0 : 2,
    borderRightWidth: isDesktop ? 3 : 0,
    borderColor: '#3d295e',
});

export default function MenuStyleRoutePlaceholder() {
    return null;
}