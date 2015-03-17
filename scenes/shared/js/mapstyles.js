var mapstyles = mapstyles || {
  styles: [{
    'stylers': [
      { 'visibility': 'off' }
    ]
  },{
    'featureType': 'water',
    'stylers': [
      { 'visibility': 'on' },
      { 'color': '#f6efe2' }
    ]
  },{
    'featureType': 'landscape',
    'stylers': [
      { 'visibility': 'on' },
      { 'lightness': 110 },
      { 'color': '#dfd7c5' }
    ]
  },{
    'featureType': 'administrative.country',
    'elementType': 'geometry.stroke',
    'stylers': [
      { 'visibility': 'on' },
      { 'invert_lightness': true },
      { 'gamma': 3.75 },
      { 'lightness': 70 },
      { 'weight': 1 }
    ]
  },{
    'featureType': 'water',
    'elementType': 'labels',
    'stylers': [
      { 'weight': 0.8 },
      { 'color': '#c5c6c4' },
      { 'lightness': 5 }
    ]
  },{
    'featureType': 'landscape.natural',
    'elementType': 'labels',
    'stylers': [
      { 'visibility': 'on' },
      { 'weight': 0.3 },
      { 'invert_lightness': true },
      { 'lightness': 40 }
    ]
  }]
};
