import qs from 'qs';
import avatar from '../assets/img/account.svg';

const buildURL = (filename, options) => {
  if (!filename) {
    return '';
  }
  const queryString = qs.stringify(options);
  return `https://${process.env.VUE_APP_IMAGE_SERVER_IMGIX}/${filename}?${queryString}`;
};

const profileImageSrc = (image, options) => {
  if (!image) {
    return avatar;
  }
  const optionsInclDefaults = _.assign({
    w: 100,
    h: 100,
    fit: 'crop',
  }, options || {});

  return buildURL(image.filename, optionsInclDefaults);
};

export default {
  methods: {
    Imgix: buildURL,
    profileImageSrc,
  },
};

