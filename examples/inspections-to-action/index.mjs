const token = process.env.TOKEN;

//url configuration for safetyculture api call
const rootUrl = 'https://api.safetyculture.io';
const createActionUrl = '/tasks/v1/actions';
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

async function getAssetId(items) {
  const assetItem = items.find(item => item.type === "asset");
  return assetItem?.asset_item?.asset_id || null;
}

async function createAction(data) {
    const { metadata } = data.inspection;
    const insId = metadata.inspection_id
    const insTitle = metadata.inspection_name
    const siteId = metadata.site.site_id
    const assetId = await getAssetId(data.inspection.items)
    const response = await fetch(rootUrl+createActionUrl,{
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: token
      },
      body: JSON.stringify({
        title: `Review inspection: ${insTitle}`,
        description: `Automated review of ${insTitle}`,
        ...(siteId && { site_id: siteId }),
        ...(assetId && { asset_id: assetId })
      })
    })
    if(!response.ok) {
      console.log('creating action with safetyculture api failed');
      return {
        statusCode: response.status,
        body: JSON.stringify({message: 'failed to create action in safetyculture'})
      };
    }
    console.log('action created!')
};

// main handler
export const handler = async (event) => {
  const scUrl = await getUrl(event);
  const scData = await callApi(scUrl);
  await createAction(scData);
};
