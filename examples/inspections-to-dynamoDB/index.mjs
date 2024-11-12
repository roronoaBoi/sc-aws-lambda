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

//main handler
export const handler = async (event) => {
  const hookBody = JSON.parse(event.body);
  const {id: recId} = hookBody.resource;

  const url = `${rootUrl}${amUrl}/${recId}/details`;

  const response = await fetch(url, options);
  if (!response.ok) {
    console.log('fetch failed');
    return {
      statusCode: response.status,
      body: JSON.stringify({ message: 'Failed to fetch data' })
    };
  }

  const data = await response.json();

  //create payload depending on sc api
  const {metadata, template } = data.inspection;
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

  console.log('writing to db...');

//write to dynamoDB
  const write = async (arg) => {
    const command = new PutCommand(
      {
        TableName: table,
        Item: arg
      }
    );

    const dynResponse = await dynamoDb.send(command);
    if(!dynResponse.ok) {
      console.log('failed to write payload')
      return
    }
    return dynResponse;
  };

await write(payload)

console.log('payload written!')

};
