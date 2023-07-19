const url = "https://api.data.gov.sg/v1/transport/carpark-availability";

async function getCarparkInfo(url) {
  const response = await fetch(url);
  const data = await response.json();
  const jsonString = JSON.stringify(data);
  mapCarparkInfo(JSON.parse(jsonString));
}

function mapCarparkInfo(jsonString) {
  const carparkData = jsonString.items[0].carpark_data;
  const carparkList = carparkData.map((carpark) => {
    const carparkModel = {};
    carparkModel.total_lots = carpark.carpark_info.reduce((total, info) => total + parseInt(info.total_lots), 0);
    carparkModel.lots_available = carpark.carpark_info.reduce((total, info) => total + parseInt(info.lots_available), 0);
    carparkModel.carpark_number = carpark.carpark_number;
    carparkModel.category = assignCarparkCategory(carparkModel.total_lots);
    return carparkModel;
  });
  categoriseCarparkList(carparkList);
}

function assignCarparkCategory(total_lots) {
  if (total_lots < 100) return "small";
  if (total_lots < 300) return "medium";
  if (total_lots < 400) return "big";
  return "large";
}

function categoriseCarparkList(carparkList) {
  const result = groupByCategory(carparkList);
  const smallCarparkResult = [findMaxByProperty(result.small, 'lots_available'), findMinByProperty(result.small, 'lots_available')];
  const mediumCarparkResult = [findMaxByProperty(result.medium, 'lots_available'), findMinByProperty(result.medium, 'lots_available')];
  const bigCarparkResult = [findMaxByProperty(result.big, 'lots_available'), findMinByProperty(result.big, 'lots_available')];
  const largeCarparkResult = [findMaxByProperty(result.large, 'lots_available'), findMinByProperty(result.large, 'lots_available')];
  createJSONObject(smallCarparkResult, mediumCarparkResult, bigCarparkResult, largeCarparkResult);
}

function createJSONObject(...params) {
  const responseJSONObject = [];
  for (const param of params) {
    for (const innerArray of param) {
      const availableLots = innerArray.reduce((total, item) => total + item.lots_available, 0);
      const carparkNumber = innerArray.map((item) => item.carpark_number).join(", ");
      responseJSONObject.push({ available_lots: availableLots, carpark_number: carparkNumber, category: innerArray[0].category});
    }
  }
  displayJSONData(responseJSONObject);
}

function groupByCategory(arr) {
  return arr.reduce((x, y) => {
    (x[y.category] = x[y.category] || []).push(y);
    return x;
  }, {});
}

function findMaxByProperty(arr, property) {
  const values = arr.map(item => item[property]);
  const max = Math.max(...values);
  return arr.filter(item => item[property] == max);
}

function findMinByProperty(arr, property) {
  const values = arr.map(item => item[property]);
  const min = Math.min(...values);
  return arr.filter(item => item[property] == min);
}

function displayJSONData(responseJSONObject) {
  const jsonContainer = document.getElementById("myData");
  let highestLots = "";
  let lowestLots = "";
  const jsonResult = [];
  for(let i = 0; i < responseJSONObject.length; i++){
    highestLots = `
    ${responseJSONObject[i].category.toUpperCase()}
    <br>
    HIGHEST (${parseInt(responseJSONObject[i].available_lots)} lots available)<br>
    ${responseJSONObject[i].carpark_number}
    `;
    lowestLots = `
      <br><br><br><br>
      LOWEST (${parseInt(responseJSONObject[i + 1].available_lots)} lots available)<br>
      ${responseJSONObject[i + 1].carpark_number}
    `;
    jsonResult.push(highestLots + lowestLots);
    i = i + 1;
  }
  let fragment = "<ul>";
  for(i = 0; i < jsonResult.length; i++){
    fragment = fragment.concat(`<li>` + jsonResult[i] + `</li><br>`)
  }
  fragment.concat(`</ul>`)
  jsonContainer.innerHTML = `<div>${fragment}</div>`;
}

function scheduler() {
  getCarparkInfo(url);
  setTimeout(scheduler, 60000);
  console.log("Repeating..");
}

scheduler();


