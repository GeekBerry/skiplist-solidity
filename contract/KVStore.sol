pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import './ReadWriteRole.sol';
import './SkiplistLib.sol';

contract KVStore is ReadWriteRole {
    using SkipListLib for SkipListLib.SkipList;
    SkipListLib.SkipList internal _skipList;

    event StoreEvent(int indexed operate, bytes indexed keyIndex, bytes key);

    function size() public view requireRole(READER)
    returns (uint)
    {
        return _skipList.size();
    }

    function has(bytes calldata key) external view requireRole(READER)
    returns (bool)
    {
        return _skipList.has(key);
    }

    function get(bytes calldata key) external view requireRole(READER)
    returns (bytes memory)
    {
        return _skipList.get(key);
    }

    function list(bytes calldata key, uint limit, bool reverse) external view requireRole(READER)
    returns (SkipListLib.Pair[] memory) {
        return _skipList.list(key, limit, reverse);
    }

    function set(bytes calldata key, bytes calldata value) external requireRole(WRITER)
    returns (uint)
    {
        bool isSet = _skipList.set(key, value);
        if(isSet) {
            emit StoreEvent(1, key, key);
        }
        return _skipList._size;
    }

    function del(bytes calldata key) external requireRole(WRITER)
    returns (uint)
    {
        bool isDel = _skipList.del(key);
        if(isDel) {
            emit StoreEvent(-1, key, key);
        }
        return _skipList._size;
    }

    function clear() external requireRole(WRITER)
    {
        return _skipList.clear();
    }
}
