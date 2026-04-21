import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#212636',
    borderWidth: 1,
    borderColor: '#2e354d',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 12,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  text: {
    color: '#bfc0d1',
    lineHeight: 20,
  },
  button: {
    width: '60%',
    maxWidth: 250,
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#60519b',
    borderWidth: 2,
    borderColor: '#836fd1',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#a855f7',
    textAlign: 'center',
    fontWeight: '600',
  },
});
