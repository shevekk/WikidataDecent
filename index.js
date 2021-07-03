class Main 
{
  /*
   * Main class
   * @property {Map}                       map                       The map manager
   * @property {Query}                     query                     The query manager
   */
  constructor()
  {
    this.map = new Map();
    this.query = new Query();
    this.search = new Search();

    this.lang = "en";
  }

  /*
   * Init projets, get data et draw map
   */
  init()
  {
    let me = this;

    let params = me.getParams();
    if ('lang' in params)
    {
      me.lang = params["lang"];
    }

    Dictionary.load(me.lang, "", function()
    {
      me.search.display(me);

      me.map.init();
    });
  }

  /**
   * get params in the address bar
   * return {String[]}             Array of params get in address bar 
   */
  getParams()
  {
    // Get ars values of address bar
    var args = location.search.substr(1).split(/&/);
    var argsValues = [];

    for(var i =0; i < args.length; i++)
    {
      var tmp = args[i].split(/=/);
      if (tmp[0] != "") {
          argsValues[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp.slice(1).join("").replace("+", " "));
      }
    }

    return argsValues;
  }


  reloadData(wikidataElement)
  {
    let me = this;
    
    $("#loadingBar").css("display", "block");

    me.query.launch(wikidataElement, function(elements)
    {
      me.map.drawMap(me.query, elements);

      $("#loadingBar").css("display", "none");
      $("#textNbElements").html(`${Dictionary.get("NB_DESCENDANTS")} : ${me.query.nbResult}, ${Dictionary.get("NB_WITH_BIRTH_PLACE")}  : ${me.query.nbResultWithCoords}, ${Dictionary.get("NB_WITH_DATES")} : ${me.query.nbResultWithDate}`);

      // Call log
      let ajaxRequest = $.ajax({
        url:"log/log.php",
        dataType: 'json',
        method: "POST",
        data: { wikidataElement: wikidataElement, lang: me.lang, nbResult : me.query.nbResult, nbResultWithCoords : me.query.nbResultWithCoords, nbResultWithDate : me.query.nbResultWithDate, state: "OK" }
      });
    });
  }
}