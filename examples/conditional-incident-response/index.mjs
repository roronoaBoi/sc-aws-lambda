const token = process.env.TOKEN;

//url configuration for safetyculture api call
const rootUrl = 'https://api.safetyculture.io';
const getInsUrl = '/inspections/v1/inspections';
const getOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: token
  }
};

async function getUrl(event){
    const insId = event.resource.id
    return `${rootUrl}${getInsUrl}/${insId}/details`
};

async function callApi(url){
    const response = await fetch(url,getOptions);
    if(!response.ok) {
        console.log('safetyculture api call failed');
        return {
            statusCode: response.status,
            body: JSON.stringify({message: 'failed to fetch data from safetyculture'})
        };
    }
    const data = await response.json();
    return data
};

async function processData(data) {
  //define various conditions
  const condition = data.exampleCondition
  if(condition === true) {
    //follow up action
  } else {
    //no follow up action
  }
};

// main handler
export const handler = async (event) => {
  const scUrl = await getUrl(event);
  const scData = await callApi(scUrl);
  await processData(scData);
};
