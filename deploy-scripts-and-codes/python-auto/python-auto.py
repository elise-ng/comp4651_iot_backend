import boto3
import os
import random
from datetime import datetime, timedelta
import time

ec2_client = boto3.client('ec2')
ec2_client_stat = boto3.client('cloudwatch')

# function to create instances, and auto join the cluster when ready
def create_one_node():
    try:
        ec2_client.run_instances(LaunchTemplate={
            'LaunchTemplateName': 'k8s_node',
            'Version': '6'},
                            MinCount=1,
                            MaxCount=1)
        return True                
    except Exception as e:
        print(e)
        return False

# function to instance by id
def delete_instance(instanceId):
    try:
        ec2_client.terminate_instances(InstanceIds=[instanceId,])
        return True
    except Exception as e:
        return False

# function to get all instanceId
def get_all_instanceId():
    response = ec2_client.describe_instances()
    instanceIds = []
    for i in response['Reservations']:
        if i['Instances'][0]['State']['Name'] == 'running':
            instanceIds.append(i['Instances'][0]['InstanceId'])
    return instanceIds

# function to get autocreated instanceId and PC names
def get_auto_nodes():
    response = ec2_client.describe_instances()
    nodes = []
    for i in response['Reservations']:
        for keys in i['Instances'][0]['Tags']:
            if keys['Key'] == 'autocreate' and keys['Value'] == 'yes' and i['Instances'][0]['State']['Name'] == 'running':
                nodes.append([i['Instances'][0]['InstanceId'],i['Instances'][0]['PrivateDnsName'].split('.')[0]])
    return nodes


# function to delete slave node, but only the one that is auto created
def delete_one_node():
    nodes = get_auto_nodes()
    if len(nodes) == 0:
        return False
    # randomly delete one of the nodes
    ind = random.randrange(0, len(nodes))
    nodeInstanceId = nodes[ind][0]
    nodeName = nodes[ind][1]
    os.system('kubectl drain ' + nodeName + ' --ignore-daemonsets --delete-local-data')
    os.system('kubectl delete node ' + nodeName)
    if not delete_instance(nodeInstanceId):
        print('deleted node by fail to delete the instance')
        print('nodeInstanceId: ' + nodeInstanceId)
        print('nodeName: ' + nodeName)
        return False
    return True

# function to check if avg of all instance CPU exceed threshold
# both threshold and underUsage are in unit percent!
def cpu_check_and_response(threshold, underUsage):
    currTime = datetime.now()

    instanceIds = get_all_instanceId()

    total = 0.0
    count = 0

    for i in instanceIds:
        response = ec2_client_stat.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='CPUUtilization',
            Dimensions=[
                {
                    'Name': 'InstanceId',
                    'Value': i
                }
            ],
            StartTime=currTime - timedelta(seconds=6000),
            EndTime=currTime,
            Period=86400,
            Statistics=['Average',],
            Unit='Percent'
        )
        for cpu in response['Datapoints']:
            total += cpu['Average']
            count += 1

    print("=" * 30)
    cpuAvg = total/count
    print("CPU Total: " + str(total) + ", Count: " + str(count))
    print("CPU Average: " + str(cpuAvg))

    # if cpuAvg greater than defined threshold
    if cpuAvg > threshold:
        # over usage, create more instance
        create_one_node()
        print("created one node")
        print("cpuAvg: " + str(cpuAvg) + "%, threshold: " + str(threshold) + "%")
    # if cpuAvg smaller than defined underUsage
    elif cpuAvg < underUsage:
        # under usage, delete nodes
        if delete_one_node():
            print("deleted one node")
        else:
            print("remain on minimal nodes, no node deleted")
        print("cpuAvg: " + str(cpuAvg) + "%, underUsage: " + str(underUsage) + "%")
    else:
        print("cpuAvg (Good): " + str(cpuAvg))



# start to do the checking
while True:
    cpu_check_and_response(threshold=70, underUsage=20)
    time.sleep(60)