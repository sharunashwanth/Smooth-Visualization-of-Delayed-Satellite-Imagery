import os
import numpy as np
import torch
from model import Model
from utils import read
from imageio import mimsave


model = Model().eval()
model.load_state_dict(torch.load('/workspaces/Latent-Space-Interpolation/server/IFRNet_S_Vimeo90K.pth'))


def interpolate_frame(model, img0, img1):

  img0 = (torch.tensor(img0.transpose(2, 0, 1)).float() / 255.0).unsqueeze(0).cpu()
  img1 = (torch.tensor(img1.transpose(2, 0, 1)).float() / 255.0).unsqueeze(0).cpu()
  embt = torch.tensor(1/2).view(1, 1, 1, 1).float().cpu()

  imgt_pred = model.inference(img0, img1, embt).cpu()

  imgt_pred_np = (imgt_pred[0].data.permute(1, 2, 0).cpu().numpy() * 255.0).astype(np.uint8)
  return imgt_pred_np


# Define the hierarchy for interpolations
def interpolate(img1,img2):
    interpolation_tree = {
        15: (1, 30),
        7: (1, 15),
        4: (1, 7),
        2: (1, 4),
        3: (2, 4),
        5: (4, 7),
        6: (5, 7),
        11: (7, 15),
        13: (11, 15),
        14: (13, 15),
        12: (11, 13),
        9: (7, 11),
        8: (7, 9),
        10: (9, 11),
        23: (15, 30),
        19: (15, 23),
        17: (15, 19),
        16: (15, 17),
        18: (17, 19),
        21: (19, 23),
        20: (19, 21),
        22: (21, 23),
        26: (23, 30),
        28: (26, 30),
        27: (26, 28),
        29: (28, 30),
        24: (23, 26),
        25: (24, 26),
    }

    # Initialize base images
    images = {
        1: img1,
        30: img2,
    }

    # Function to compute interpolated images
    def get_interpolated_image(index):
        if index in images:
            return images[index]

        # Get dependencies
        img_a_index, img_b_index = interpolation_tree[index]
        img_a = get_interpolated_image(img_a_index)
        img_b = get_interpolated_image(img_b_index)

        # Compute interpolation and store it
        images[index] = interpolate_frame(model,img_a, img_b)
        return images[index]

    # Generate all interpolated images
    for img_index in interpolation_tree:
        get_interpolated_image(img_index)

    return images

# `images` now contains all the interpolated images
# print(f"Interpolated images created: {sorted(images.keys())}")

