<p align="center">
  <img src="assets/img/icon-180.png" width="120" height="120" alt="Pocket Pinball">
</p>

<h1 align="center">Pocket Pinball</h1>

<p align="center">
  Portrait arcade pinball for iPhone<br>
  <a href="https://pinball.vanjay.cn/">Website</a> ·
  <a href="https://github.com/wangwanjie/PinballMachine/releases/latest">Download</a> ·
  <a href="README.md">简体中文</a>
</p>

<p align="center">
  <img src="assets/img/shot-charge-360.webp" width="220" alt="Charging the spring">
  <img src="assets/img/shot-win-360.webp" width="220" alt="Jackpot result">
  <img src="assets/img/shot-nearmiss-360.webp" width="220" alt="Near miss">
</p>

## About

Pocket Pinball is a portrait arcade marble game: insert marbles, lock the multiplier, pull the spring and slam the steel ball into a lit slot.

- **A round**: insert marbles (at least 5) → the cabinet locks a multiplier and lights some of the slots → drag the spring down to charge and release to strike → drop through the peg field into a lit slot to win marbles back at the multiplier. Results are JACKPOT, SO CLOSE or MISS.
- **Cabinet vibes**: 9 cabinet skins, 8 music themes and 8 sound styles. Skins change lights and colours while the rules stay the same; some skins also switch the Home Screen icon. Free by default: the Sunny Arcade and Midnight Neon skins, the Neon Pulse and Candy Bounce music themes, and the Glass Current and Jelly Marble sound styles (the free set can be adjusted by remote configuration). Everything else opens with the one-time in-app Lifetime Unlock.
- **Marbles**: below 100 marbles you can reset back to 100; free resets per day are 3 standard and 6 with Lifetime Unlock.
- **No account**; progress stays on your device. Languages: English, Simplified Chinese, Traditional Chinese.

## Download & install

| Item | Details |
| --- | --- |
| Version | 1.0 (build 1) |
| Requires | iPhone, iOS 15.0 or later |
| Package | [PocketPinball.ipa](https://github.com/wangwanjie/PinballMachine/releases/latest/download/PocketPinball.ipa) (about 2.9 MB) |
| Signing | Ad Hoc (profile expires 2027-04-05) |

**Install limits (please read first)**

1. This build is distributed outside the App Store. It is signed with an Ad Hoc provisioning profile, so it installs directly only on devices whose UDID is registered in that profile; installation fails on any other device.
2. Registered devices: drag the IPA onto your connected iPhone in Finder or Apple Configurator on a Mac.
3. Other devices: you can try re-signing with your own Apple ID using tools such as AltStore or Sideloadly. Success depends on the tool and account and is not guaranteed; free Apple ID signatures usually need refreshing every 7 days.
4. The profile expires on 2027-04-05. After that, installed copies will no longer open and you will need a newer build.
5. In this distribution, in-app purchases run in Apple’s sandbox and cannot take real payments. The default free skins, music and sounds are fully playable.

## Privacy

- Language, audio, appearance, marble balance, daily reset counters and an install identifier are stored on your device.
- At launch the app fetches runtime configuration (privacy link, free content, reset policy and more) from RCPlatform; requests carry the app version and the locally generated install identifier.
- Purchases and restores go through Apple StoreKit; the app never sees payment card details.

See the full [privacy policy](https://pinball.vanjay.cn/public/privacy-policy.html) and the [support page](https://pinball.vanjay.cn/public/support.html).

## Feedback

Open an [issue](https://github.com/wangwanjie/PinballMachine/issues) or email vanjay.dev@gmail.com.

More apps: [vanjay.cn](https://vanjay.cn)

© 2026 VanJay
