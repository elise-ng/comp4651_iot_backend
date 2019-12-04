## Script to be run to create a slave node

# better to change the hostname to node<index> before running the install #
# sudo echo node<index> > /etc/hostname
# sudo reboot now

# turnoff swap
sudo swapoff -a

# allow docker to be run as non-root user
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker

# install docker
sudo apt-get update
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io -y

# install kubeadm kubectl kubelet
sudo apt-get update && sudo apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -

cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# join the cluster #
# sudo su
# kubeadm join <master-internal-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>