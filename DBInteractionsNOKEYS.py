from decimal import Decimal
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr

def createTable(dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource(
            'dynamodb',
            # endpoint_url="arn:aws:dynamodb:us-east-1:370570609447:table/TinkersWater",
            region_name='us-east-1',
            aws_access_key_id='',
            aws_secret_access_key='')

    try:
        table = dynamodb.create_table(
            TableName='TinkersWater',
            AttributeDefinitions=[
                {
                    'AttributeName': 'Epoch',
                    'AttributeType': 'N'
                }
            ],
            KeySchema=[
                {
                    'AttributeName': 'Epoch',
                    'KeyType': 'HASH'
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 10,
                'WriteCapacityUnits': 10
            }
        )
    except Exception:
        table = dynamodb.Table('TinkersWater')

    return table

def getWaterData(epoch, dynamodb=None):
    if not dynamodb:
        dynamodb = boto3.resource(
            'dynamodb',
            # endpoint_url="arn:aws:dynamodb:us-east-1:370570609447:table/TinkersWater",
            region_name='us-east-1',
            aws_access_key_id='',
            aws_secret_access_key=''
        )

    table = dynamodb.Table('TinkersWater')

    try:
        response = table.get_item(Key={'Epoch': epoch})
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        return response


def queryWaterData(epoch1, epoch2, dynamodb=None):
    # make sure epoch1 is less than epoch2
    # if epoch1 > epoch2:
    #     epoch1, epoch2 = epoch2, epoch1

    if not dynamodb:
        dynamodb = boto3.resource(
            'dynamodb',
            # endpoint_url="arn:aws:dynamodb:us-east-1:370570609447:table/TinkersWater",
            region_name='us-east-1',
            aws_access_key_id='',
            aws_secret_access_key=''
        )

    table = dynamodb.Table('Transactions')

    try:
        response = table.query(
            KeyConditionExpression=Key('Epoch').eq('johndoe')
        )
        return response['Items']
    except ClientError as e:
        print(e.response['Error']['Message'])
    # else:
    #     return response


def scanWaterData(epoch1, epoch2, dynamodb=None):
    # make sure epoch1 is less than epoch2
    if epoch1 > epoch2:
        epoch1, epoch2 = epoch2, epoch1

    epoch1 = Decimal(epoch1)
    epoch2 = Decimal(epoch2)

    if not dynamodb:
        dynamodb = boto3.resource(
            'dynamodb',
            # endpoint_url="arn:aws:dynamodb:us-east-1:370570609447:table/TinkersWater",
            region_name='us-east-1',
            aws_access_key_id='',
            aws_secret_access_key=''
        )

    table = dynamodb.Table('Transactions')

    try:
        response = table.scan(
            FilterExpression=Attr('Epoch').between(epoch1, epoch2)
        )
        data = response['Items']
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'],
                                  FilterExpression=Attr('Epoch').between(epoch1, epoch2))
            data.extend(response['Items'])

        return data
    except ClientError as e:
        print(e.response['Error']['Message'])
