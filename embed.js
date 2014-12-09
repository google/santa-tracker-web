(function() {
var container = document.getElementById('santa-tracker-container');
if (container) {
  var iframe = document.createElement('iframe');
  iframe.width = iframe.height = '100%';
  iframe.style.border = '0';
  iframe.style.minHeight = '350px';
  iframe.style.minWidth = '500px';
  iframe.style.maxHeight = '500px';
  iframe.style.maxWidth = '800px';
  container.style.display = 'inline-block';
  container.style.height =
      (parseInt(getComputedStyle(container).height) || 400) + 'px';
  container.style.width =
      (parseInt(getComputedStyle(container).width) || 600) + 'px';
  iframe.style.maxWidth = '800px';

  var siteUrl = encodeURIComponent(window.location.href);
  iframe.src = 'https://santatracker.google.com/?api_client=web_embed&site=' +
               siteUrl + '#village';
  container.appendChild(iframe);
}
})();
