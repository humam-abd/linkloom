export function getHostname(url: string) {
  try {
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}
