
# Raw Footage Filename Search Reference

This guide provides filename patterns used by various cameras, phones, dashcams, drones, and security systems. These patterns often appear in unedited uploads — ideal for discovering raw, straight-from-device footage.

---

## Search Techniques

### YouTube
- Use `intitle:` to target filenames left in video titles.
- Combine wildcards with logical ORs:
  ```text
  intitle:"GOPR*" OR intitle:"GH01*" OR intitle:"DJI_*"
  ```

### Google
- Use `site:` and `filetype:` operators:
  ```text
  "GH010001" site:youtube.com
  "DJI_2023" site:drive.google.com
  "*.MTS" OR "GH01*" OR "BRAW*" filetype:mp4
  ```

### General Tips
- Look for file patterns like timestamps, default camera prefixes, or lack of human-readable titles.
- Use combinations like:
  ```text
  "20230418_142301" OR "CAM1_20230418" OR "MVI_0001"
  ```

---

## Filename Prefixes by Device

### Canon
- `MVI_0001`
- `IMG_0001`
- `STILLS_0001`
- `CRW_0001`

Wildcard search: `intitle:"MVI_*"` or `"IMG_20*"`

---

### Sony
- `C0001`
- `CLIP0001`
- `MAH00001`
- `MOVI0001`
- `00001.MTS`

Wildcard: `intitle:"MAH*" OR "*.MTS"`

---

### DJI (Drones, Osmo, Pocket)
- `DJI_0001`
- `DJI_XXXX.MOV`
- `VID_XXXX_DJI`
- `MCDJI`

Wildcard: `intitle:"DJI_*" OR "MCDJI"`

---

### GoPro
- `GOPR0001.MP4`
- `GP010001.MP4`
- `GX010001`

Wildcard: `intitle:"GOPR*" OR "GP01*" OR "GX01*"`

---

### Garmin (Dashcams & Action Cams)
- `GH010001`
- `GMetrix`
- `GARMIN0001`

Wildcard: `intitle:"GH01*" OR "GARMIN*"`

---

### Blackmagic Design
- `A001_010101_001.RAW`
- `BMCC_XXXX`
- `BRAW_XXXX`

Wildcard: `intitle:"BRAW*" OR "BMCC*"`

---

### Android Phones (Samsung, LG, etc.)
- `VID_YYYYMMDD_WAXXXX`
- `20230418_142301`
- `video_2023-04-18_14-23-01`
- `Snapchat-12345678`
- `WhatsApp Video 2023-04-18 at 14.23.01`

Wildcard: `intitle:"VID_20*" OR "video_20*" OR "Snapchat-*"`

---

### iOS Devices
- `IMG_0001.MOV`
- `IMG_E0001.MOV`
- `VID_2023...`
- `trim.*`

Wildcard: `intitle:"IMG_*" OR "VID_20*" OR "trim.*"`

---

### Security Cameras / CCTV / NVRs
- `CH01_20230418_143000`
- `CAM1_20230418_14-30-00`
- `REC001.AVI`
- `000001.264`
- `HIK_20230418_14-30`
- `EZVIZ_VIDEO_20230418_143000`

Wildcard: `intitle:"CH01*" OR "CAM1*" OR "EZVIZ*"`

---

### Dashcams (Viofo A119, Thinkware, BlackVue, etc.)
- `A119_20230418_143000.MP4`
- `20230418_143000_F.MP4`
- `BLACKVUE_0001.MP4`
- `Thinkware_2023_04_18_14_30_00.mp4`

Wildcard: `intitle:"A119*" OR "BLACKVUE*" OR "Thinkware*"`

---

### Windows Phone / Legacy Devices
- `WP_20230418_14_30_00_Pro.mp4`
- `CAM00001`

Wildcard: `intitle:"WP_*" OR "CAM*" OR "CAM000*"`

---

## Summary
These filename patterns are highly specific to the devices that captured the footage. Searching for them directly can reveal raw, unedited uploads — especially when paired with filters to remove music, titles, or edited footage.

Happy digging!
