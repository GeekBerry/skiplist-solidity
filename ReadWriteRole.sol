pragma solidity ^0.6.0;

contract ReadWriteRole {
    uint8 constant internal ADMIN = 4;
    uint8 constant internal WRITER = 2;
    uint8 constant internal READER = 1;
    mapping(address=>uint8) userMap;
    event RoleEvent(int indexed operate, address indexed user, uint8 indexed role);

    constructor() public {
        userMap[msg.sender] = ADMIN; // only way to set "ADMIN" flag;
        emit RoleEvent(1, msg.sender, ADMIN);

        addReader(msg.sender);
        addWriter(msg.sender);
    }

    function _addRole(address user, uint8 role) internal {
        userMap[user] = userMap[user] | role;
        emit RoleEvent(1, user, role);
    }

    function _removeRole(address user, uint8 role) internal {
        userMap[user] = userMap[user] & (~role);
        emit RoleEvent(-1, user, role);
    }

    modifier requireRole(uint8 role) {
        require(userMap[msg.sender] & role > 0, 'Permissions error!');
        _;
    }

    function getRole(address user) public view 
    returns (bool isReader, bool isWriter, bool isAdmin) 
    {
        uint8 role = userMap[user];
        return (role & READER > 0, role & WRITER > 0, role & ADMIN > 0);
    }

    function addWriter(address user) public requireRole(ADMIN) 
    {
        _addRole(user, WRITER);
    }

    function removeWriter(address user) public requireRole(ADMIN) 
    {
        _removeRole(user, WRITER);
    }

    function addReader(address user) public requireRole(ADMIN) 
    {
        _addRole(user, READER);
    }
    
    function removeReader(address user) public requireRole(ADMIN) 
    {
        _removeRole(user, READER);
    }
}
