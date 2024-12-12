# Smooth-Visualization-of-Satellite-Imagery
Project developed under the problem statement 1736 for Smart India Hackathon 2024

PS ID: 1736

Problem Statement: AI based frame interpolation, video generation and display system for WMS services

## Implementation Details

1. Automatic video generation using frame interpolation techniques.
1. Compatibility with OGC-compatible WMS services.
1. Overlaying videos on an interactive browser-based map using Leaflet.
1. Handling deformable objects like clouds

## Further Improvements to be Expected

1. Optimizing our model for low-end devices to improve performance
1. Enhancing accuracy by reducing noisy outputs and improving overall model reliability
1. Implementing techniques to improve model efficiency and reduce computational requirements
1. Exploring noise reduction techniques to further refine our model's output

## Citation and Credits

### Leaflet JS for Interactive Maps

```
cff-version: 1.2.0
title: Leaflet, a JavaScript library for interactive maps
message: >-
  If you use this software, please cite it using the
  metadata from this file.
type: software
authors:
  - given-names: Volodymyr
    family-names: Agafonkin
    email: agafonkin@gmail.com
repository-code: 'https://github.com/Leaflet/Leaflet'
url: 'https://leafletjs.com'
license: BSD-2-Clause
```

### Interpolation Models

#### IFRNet: Intermediate Feature Refine Network for Efficient Frame Interpolation

```@InProceedings{Kong_2022_CVPR,
author = {Kong, Lingtong and Jiang, Boyuan and Luo, Donghao and Chu, Wenqing and Huang, Xiaoming and Tai, Ying and Wang, Chengjie and Yang, Jie},
title = {IFRNet: Intermediate Feature Refine Network for Efficient Frame Interpolation},
booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
year = {2022}
}
```

#### Adaptive Separable Convolution for Video Frame Interpolation

[Read Paper](https://arxiv.org/abs/1809.07759v1)
