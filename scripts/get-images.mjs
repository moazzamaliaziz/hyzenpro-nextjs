fetch('https://hyzenpro.com/about-us/')
  .then(res => res.text())
  .then(html => {
    const imgRegex = /<img[^>]+src=["'](https:\/\/hyzenpro\.com\/wp-content\/uploads\/[^"']+)["']/g;
    let match;
    const images = new Set();
    while ((match = imgRegex.exec(html)) !== null) {
      images.add(match[1]);
    }
    console.log(Array.from(images).join('\n'));
  });
