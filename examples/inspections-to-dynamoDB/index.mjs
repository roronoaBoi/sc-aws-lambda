import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const token = process.env.TOKEN;
const table = process.env.DYNAMO_TABLE_NAME

//url configuration for safetyculture api call
const rootUrl = 'https://api.safetyculture.io';
const amUrl = '/inspections/v1/inspections';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: token
  }
};

async function getUrl(event){
    const hookBody = JSON.parse(event.body);
    const {id: recId} = hookBody.resource;
    return `${rootUrl}${amUrl}/${recId}/details`
};

async function callApi(url){
    const response = await fetch(url,options);
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

async function createPayload(data) {
    const {metadata, template} = data.inspection;
    const payload = {
        id: metadata.inspection_id,
        title: metadata.inspection_name,
        site_id: metadata.site.site_id,
        site_name: metadata.site.site_name,
        template_id: template.template_id,
        template_name: template.template_name,
        last_modified_by_id: metadata.last_modified_by.id,
        last_modified_by_name: metadata.last_modified_by.name
      };
      return payload
};

async function writeToDb(payload) {
    const command = new PutCommand(
        {
            TableName: table,
            Item: (payload)
        }
    );
    const dynResponse = await dynamoDb.send(command);
    if(dynResponse.$metadata.httpStatusCode !== 200) {
        console.log('failed to write payload to table...')
        return
    }
    console.log('payload written!')
};

//main handler
export const handler = async (event) => {
const scUrl = await getUrl(event);
const scData = await callApi(scUrl);
const scPayload = await createPayload(scData);
await writeToDb(scPayload)
};
