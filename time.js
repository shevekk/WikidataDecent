L.Time = L.Control.extend({
    options: {
        position: "topright",
        range: !1
    },
  initialize: function(options) {

    this.minValue = 1500;
    this.maxValue = 2000;
    //options.position= "topright";

    L.Util.setOptions(this, options);
   },
    extractTimestamp: function (a, b) {
        return b.isEpoch && (a = new Date(parseInt(a)).toString()), a.substr(b.startTimeIdx, b.startTimeIdx + b.timeStrLength);
    },
    setPosition: function (a) {
        var b = this._map;
        return b && b.removeControl(this), (this.options.position = a), b && b.addControl(this), this.startSlider(), this;
    },
    onAdd: function(a) 
    {
        this.options.map = a;
        let c = this.options;
        var b = L.DomUtil.create("div", "slider", this._container);
        $(b).append(
            '<div id="leaflet-slider" style="width:200px"><div class="ui-slider-handle"></div><div id="slider-timestamp" style="width:200px; margin-top:13px; background-color:#FFFFFF; text-align:center; border-radius:5px;"></div></div>'
        ),
        $(b).mousedown(function () {
           a.dragging.disable();
        }),
        $(document).mouseup(function () {
            a.dragging.enable(), (c.range || !c.alwaysShowDate) && $("#slider-timestamp").html("");
        });
        return b;
    },
    startSlider: function (map, minYears, maxYears) {

        let me = this;

        me.minValue = minYears;
        me.maxValue = maxYears;

        let step = 10;

        let diff = maxYears - minYears;
        step = Math.round(diff / 30);

        if(step > 10)
        {
            step = 10;
        }
        else if(step < 1)
        {
            step = 1;
        }
        $("#leaflet-slider").css("visibility", "visible");
        $("#leaflet-slider").slider({
            range: true,
            min: minYears,
            max: maxYears,
            values: [ minYears, maxYears ],
            step: step,
            slide : function(e, ui) {

                me.minValue = ui.values[0];
                me.maxValue = ui.values[1];
                
                $("#slider-timestamp").html(me.minValue + " - " + me.maxValue);
            },
            stop: function(e, ui) {
                me.minValue = ui.values[0];
                me.maxValue = ui.values[1];

                map.updateElementWithDates(ui.values[0], ui.values[1]);
            }
        });

        $("#leaflet-slider").hover(function() {
            $("#slider-timestamp").html(me.minValue + " - " + me.maxValue);
        }, function () {
            $("#slider-timestamp").html("")
        });
    },
    hide: function()
    {
        $("#leaflet-slider").css("visibility", "hidden");
    },
    onRemove: function(map) {
        // Tear down the control.
    }
});

L.time = function(opts) {
    return new L.Time(opts);
}