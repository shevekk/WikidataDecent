class Map 
{
  /*
   * Map class
   * @property {L.map}                         map                        Leaflet map
   * @property {L.markerClusterGroup}          pointLayer                 Layer of all markers
   */
  constructor()
  {
    this.map = null;
    this.pointLayer = new L.markerClusterGroup();
    this.splider = null;
    this.elements = [];
  }

  /*
   * Init the map (empty)
   */
  init()
  {
    let me = this;

    me.map = L.map('map', {
      center: [46.7213889, 2.4011111],
      zoom: 6
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(me.map);

    me.map.addLayer(me.pointLayer);

    //this.map.addControl(test);
    this.splider = L.time({}).addTo(me.map);
    
  }

  /*
   * Display ploint in map
   * @param {Element[]}                         elements                     Array of all element to draw   
   */
  drawMap(query, elements)
  {
    let me = this;

    this.elements = elements;
    this.pointLayer.clearLayers();

    let pointArray = [];

    for(let i = 0; i < elements.length; i++)
    {
      let coords = this.transformPoint(elements[i].coords);

      let point = L.marker(coords).bindPopup(`<a href="${elements[i].item}" target="_blank">${elements[i].itemLabel}</a>`);

      this.pointLayer.addLayer(point);

      pointArray.push(point);
    }

    if($("#enableDateFilter").prop("checked") == true)
    {
      this.splider.startSlider(this, query.minYearDate, query.maxYearDate);
    }

    this.map.fitBounds(L.featureGroup(pointArray).getBounds());

    // Manage date filter checkbox actions
    $("#enableDateFilter").click(function() 
    {
      if($("#enableDateFilter").prop("checked") == true)
      {
        me.splider.startSlider(me, query.minYearDate, query.maxYearDate);
      }
      else
      {
        me.splider.hide();
        me.drawMap(query, me.elements)
      }
    });
  }

  /**
   * Update visible element with filter dates
   * @param {Number}                         startDate                     Start date of the filter 
   * @param {Number}                         endDate                       End date of the filter 
   */
  updateElementWithDates(startDate, endDate)
  {
    this.pointLayer.clearLayers();

    for(let i = 0; i < this.elements.length; i++)
    {
      let valid = false;
      if(this.elements[i].birthDate)
      {
        let minYear = parseInt(this.elements[i].birthDate.split("-")[0]);
        let maxYear = parseInt(this.elements[i].deathDate.split("-")[0]);

        if(minYear <= endDate && maxYear >= startDate)
        {
          valid = true;
        }
      }

      if(valid)
      {
        let coords = this.transformPoint(this.elements[i].coords);

        let point = L.marker(coords).bindPopup(`<a href="${this.elements[i].item}" target="_blank">${this.elements[i].itemLabel}</a>`);

        this.pointLayer.addLayer(point);
      }
    }
  }

  /**
   * Tranform wkt point to coords array
   * @param {String}                   wkt                The wkt cordonate content
   * @return {Array}                                      The coords array
   */
  transformPoint(wkt)
  {
    let str = wkt.replace('Point(', '').replace(')', '');
    let coords = str.split(' ');
    coords = coords.reverse();
    
    return coords;
  }
}