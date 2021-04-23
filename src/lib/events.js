


export const elementDimentions = entry => {
  let width, height;

  // Current specs (late 2020)
  if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
    width = entry.borderBoxSize[0].inlineSize;
    height = entry.borderBoxSize[0].blockSize;
  }

  // On old spec, only contentRect (late 2020: Safari...)
  else if (entry.contentRect) {
    const targetStyle = window.getComputedStyle(entry.target, null);
    width = entry.contentRect.width +
      parseFloat(targetStyle.getPropertyValue('padding-left')) +
      parseFloat(targetStyle.getPropertyValue('padding-right'));
    height = entry.contentRect.height +
      parseFloat(targetStyle.getPropertyValue('padding-top')) +
      parseFloat(targetStyle.getPropertyValue('padding-bottom'));
  }

  return { width, height };
}

