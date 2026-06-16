// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FoodTraceChain {
    enum Role { None, Farmer, Processor, Distributor, Retailer, Consumer, IoTSensor }
    enum ProductState { Farmed, Processed, Distributed, Retailed, Sold }

    struct User {
        string name;
        Role role;
        bool isRegistered;
    }

    struct TraceStep {
        uint256 timestamp;
        address handler;
        string data; // can be JSON or text
        bytes32 stepHash;
        bytes32 previousHash;
    }

    struct Product {
        uint256 id;
        string name;
        address creator;
        uint256 creationTime;
        ProductState state;
        bool exists;
    }

    mapping(address => User) public users;
    mapping(uint256 => Product) public products;
    mapping(uint256 => TraceStep[]) private productHistory;
    uint256 public nextProductId = 1;

    event UserRegistered(address indexed userAddress, string name, Role role);
    event ProductCreated(uint256 indexed productId, string name, address indexed creator);
    event ProductUpdated(uint256 indexed productId, address indexed handler, ProductState newState, string data);

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "Unauthorized role");
        _;
    }

    function registerUser(string memory _name, Role _role) public {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(_role != Role.None, "Invalid role");
        
        users[msg.sender] = User({
            name: _name,
            role: _role,
            isRegistered: true
        });

        emit UserRegistered(msg.sender, _name, _role);
    }

    function createProduct(string memory _name, string memory _initialData) public onlyRole(Role.Farmer) returns (uint256) {
        uint256 productId = nextProductId++;
        
        products[productId] = Product({
            id: productId,
            name: _name,
            creator: msg.sender,
            creationTime: block.timestamp,
            state: ProductState.Farmed,
            exists: true
        });

        bytes32 prevHash = bytes32(0);
        bytes32 currentHash = keccak256(abi.encodePacked(productId, block.timestamp, msg.sender, _initialData, prevHash));

        productHistory[productId].push(TraceStep({
            timestamp: block.timestamp,
            handler: msg.sender,
            data: _initialData,
            stepHash: currentHash,
            previousHash: prevHash
        }));

        emit ProductCreated(productId, _name, msg.sender);
        return productId;
    }

    function updateProductStage(uint256 _productId, string memory _data) public onlyRegistered {
        require(products[_productId].exists, "Product does not exist");
        
        Role userRole = users[msg.sender].role;
        ProductState currentState = products[_productId].state;
        
        if (userRole == Role.Processor) {
            require(currentState == ProductState.Farmed, "Product must be Farmed before Processing");
            products[_productId].state = ProductState.Processed;
        } else if (userRole == Role.Distributor) {
            require(currentState == ProductState.Processed, "Product must be Processed before Distributing");
            products[_productId].state = ProductState.Distributed;
        } else if (userRole == Role.Retailer) {
            require(currentState == ProductState.Distributed, "Product must be Distributed before Retailing");
            products[_productId].state = ProductState.Retailed;
        } else if (userRole == Role.Consumer) {
            require(currentState == ProductState.Retailed, "Product must be Retailed before it is Sold");
            products[_productId].state = ProductState.Sold;
        } else {
            revert("Invalid role or stage for updating product");
        }
        
        TraceStep[] storage history = productHistory[_productId];
        bytes32 prevHash = history[history.length - 1].stepHash;
        
        bytes32 currentHash = keccak256(abi.encodePacked(_productId, block.timestamp, msg.sender, _data, prevHash));

        history.push(TraceStep({
            timestamp: block.timestamp,
            handler: msg.sender,
            data: _data,
            stepHash: currentHash,
            previousHash: prevHash
        }));

        emit ProductUpdated(_productId, msg.sender, products[_productId].state, _data);
    }

    function addTelemetry(uint256 _productId, string memory _telemetryData) public onlyRole(Role.IoTSensor) {
        require(products[_productId].exists, "Product does not exist");
        
        TraceStep[] storage history = productHistory[_productId];
        bytes32 prevHash = history[history.length - 1].stepHash;
        
        bytes32 currentHash = keccak256(abi.encodePacked(_productId, block.timestamp, msg.sender, _telemetryData, prevHash));

        history.push(TraceStep({
            timestamp: block.timestamp,
            handler: msg.sender,
            data: _telemetryData,
            stepHash: currentHash,
            previousHash: prevHash
        }));

        // State remains the same, just logging data
        emit ProductUpdated(_productId, msg.sender, products[_productId].state, _telemetryData);
    }

    function getProduct(uint256 _productId) public view returns (Product memory) {
        require(products[_productId].exists, "Product does not exist");
        return products[_productId];
    }

    function getProductHistory(uint256 _productId) public view returns (TraceStep[] memory) {
        require(products[_productId].exists, "Product does not exist");
        return productHistory[_productId];
    }
    
    function getUserRole(address _user) public view returns (Role) {
        return users[_user].role;
    }

    function isRegistered(address _user) public view returns (bool) {
        return users[_user].isRegistered;
    }

    function getUser(address _user) public view returns (User memory) {
        return users[_user];
    }
}
