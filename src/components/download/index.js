const Download = (data, type, name) => {
  const blob = new Blob(data, {type});
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.download = name;
  a.href = url;
  a.click();
};

const DownloadUrl = (url, name) => {
  const a = document.createElement('a');
  a.download = name;
  a.href = url;
  a.click();
};

export {
  Download,
  DownloadUrl,
};
