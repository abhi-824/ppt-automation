/* global PowerPoint */

/**
 * Deletes all slides from the current presentation
 */
export const deleteAllSlides = async () => {
  await PowerPoint.run(async (context) => {
    const slides = context.presentation.slides.load("items/id");
    await context.sync();
    slides.items.forEach(slide => slide.delete());
    await context.sync();
  });
};

/**
 * Inserts slides from a base64-encoded PowerPoint file
 * @param {string} pptBase64 - Base64-encoded PowerPoint file
 */
export const insertSlidesFromBase64 = async (pptBase64) => {
  await PowerPoint.run(async (context) => {
    context.presentation.insertSlidesFromBase64(pptBase64, {
      formatting: "UseDestinationTheme",
      targetSlideId: null
    });
    await context.sync();
  });
};
export function uint8ToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
export const getCurrentSlideAsBase64 = () => {
  return new Promise((resolve, reject) => {
    Office.context.document.getFileAsync(
      Office.FileType.Compressed,
      (result) => {
        if (result.status !== Office.AsyncResultStatus.Succeeded) {
          reject(result.error);
          return;
        }

        const file = result.value;
        const sliceCount = file.sliceCount;
        let slices = [];

        const loadSlice = (i) => {
          file.getSliceAsync(i, (sliceResult) => {
            if (sliceResult.status !== Office.AsyncResultStatus.Succeeded) {
              reject(sliceResult.error);
              return;
            }

            // sliceResult.value.data is an array of bytes
            slices.push(sliceResult.value.data);

            if (i + 1 < sliceCount) {
              loadSlice(i + 1);
            } else {
              file.closeAsync();

              // Flatten the slices into a single Uint8Array
              const flat = Uint8Array.from(slices.flat());

              resolve(flat);
            }
          });
        };

        loadSlice(0);
      }
    );
  });
};
