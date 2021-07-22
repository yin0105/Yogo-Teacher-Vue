export default relativePath => {

  const IS_CHROME = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  const IS_SAFARI = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  let fileUrl = process.env.VUE_APP_API_ROOT + relativePath

    //iOS devices do not support downloading. We have to inform user about this.
    if (/(iP)/g.test(navigator.userAgent)) {
      //alert('Your device does not support files downloading. Please try again in desktop browser.');
      window.open(fileUrl, '_blank');
      return false;
    }

    //If in Chrome or Safari - download via virtual link click
    if (IS_CHROME || IS_SAFARI) {
      //Creating new link node.
      var link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('target','_blank');

      if (link.download !== undefined) {
        //Set HTML5 download attribute. This will prevent file from opening if supported.
        var fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1, fileUrl.length);
        link.download = fileName;
      }

      //Dispatching click event.
      if (document.createEvent) {
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
        return true;
      }
    }

    // Force file download (whether supported by server).
    if (fileUrl.indexOf('?') === -1) {
      fileUrl += '?download';
    }

    window.open(fileUrl, '_blank');
    return true;




}

