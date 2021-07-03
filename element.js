class Element 
{
  /*
   * Element of a map point
   * @property {Array}                         binding                        Query result data binding
   */
  constructor(binding)
  {
    this.item = binding['item']['value'];
    this.itemLabel = binding['itemLabel']['value'];

    this.place = binding['place']['value'];
    this.placeLabel = binding['placeLabel']['value'];

    this.coords = binding['coords']['value'];

    this.birthDate = null;
    this.deathDate = null;

    if(binding['birthDate'])
    {
      this.birthDate = binding['birthDate']['value']
    }
    if(binding['deathDate'])
    {
      this.deathDate = binding['deathDate']['value'];
    }

    if(!this.deathDate && this.birthDate)
    {
      let actualYears = new Date().getFullYear();
      if(parseInt(this.birthDate.split("-")[0]) + 100 > actualYears)
      {
        this.deathDate = actualYears + "-01-01";
      }
      else
      {
        this.deathDate = this.birthDate;
      }
    }
  }
}