package obfs

import (
	"log"

	utls "github.com/refraction-networking/utls"
)

var activeHelloID utls.ClientHelloID

func EnableUTLS(profile string) {
	var id utls.ClientHelloID
	switch profile {
	case "chrome_124", "chrome_100":
		id = utls.HelloChrome_100
	case "chrome_102":
		id = utls.HelloChrome_102
	case "firefox_125", "firefox_120":
		id = utls.HelloFirefox_120
	case "firefox_105":
		id = utls.HelloFirefox_105
	case "safari_17", "safari_16":
		id = utls.HelloSafari_16_0
	case "edge_122", "edge_106":
		id = utls.HelloEdge_106
	case "edge_85":
		id = utls.HelloEdge_85
	case "ios_14":
		id = utls.HelloIOS_14
	case "android":
		id = utls.HelloAndroid_11_OkHttp
	case "brave_123", "brave":
		id = utls.HelloRandomized
	default:
		id = utls.HelloRandomized
	}
	activeHelloID = id
	log.Printf("[uTLS] Fingerprint set → profile: %s (%s)", profile, id.Str())
}

func GetActiveHelloID() utls.ClientHelloID {
	return activeHelloID
}
