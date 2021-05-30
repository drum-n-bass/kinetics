export default obj => {

  // Transform "random(min,max)" to a number
  const prefix = "random";
  const regex = new RegExp(`"random\\(([0-9]*[.])?[0-9]+,([0-9]*[.])?[0-9]+\\)"`, "ig");
  const toFloat = value => parseFloat(value.replace(/^\D+/g, ''));  // convert contaminated string to float

  let str = JSON.stringify(obj);  // stringify and regex, instead of interating the object+array values. both work..
  str = str.replaceAll(regex, s => {
    const min = toFloat(s.split(',')[0]);
    const max = toFloat(s.split(',')[1]);
    return Math.random() * (max - min) + min;
  });

  // <more transformation here>

  const result = JSON.parse(str);
  // console.log(result);
  return result;
}
