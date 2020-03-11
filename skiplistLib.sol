pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

library SkipListLib {
    uint constant MAX_LEVEL = 16;
    uint constant DENOMINATOR = 4;
    uint constant ALLOC_RETRY_TIMES = 10;
    uint32 constant NULL_PTR = 0;

    struct _Node {
        bytes key;
        bytes value;

        uint32 backward;
        uint32[MAX_LEVEL] forward;
    }

    struct _FindInfo {
        uint32 ptr;
        uint32[MAX_LEVEL] levelPtr;
    }

    struct Pair {
        bytes key;
        bytes value;
    }

    struct SkipList {
        mapping(uint32=>_Node) _map;
        uint32 _size;
    }

    // =========================================
    function __min(uint a, uint b) private pure
    returns (uint)
    {
        if(a < b) {
            return a;
        }
        return b;
    }

    function __compare(bytes memory one, bytes memory other) private pure
    returns (int)
    {
        for(uint i=0; i<__min(one.length, other.length); i++) {
            if(one[i] < other[i]) {
                return -1;
            } else if(one[i] > other[i]) {
                return 1;
            }
        }

        if(one.length < other.length) {
            return -1;
        } else if (one.length > other.length) {
            return 1;
        }

        return 0;
    }

    function __random(uint seed) private view
    returns (uint)
    {
        bytes memory encode = abi.encodePacked(block.difficulty, block.coinbase, now, seed);
        return uint256(keccak256(encode));
    }

    function _randomLevel(uint max, uint denominator) private view
    returns (uint)
    {
        uint level = 1;
        while(level<max && __random(level) % denominator == 0) {
            level += 1;
        }
        return level;
    }

    // -----------------------------------------
    function _allocPtr(SkipList storage self) internal view
    returns (uint32)
    {
        for (uint i=0; i<ALLOC_RETRY_TIMES; i++) { // key will not be empty
            uint32 ptr = uint32(__random(i));

            if(self._map[ptr].key.length == 0) {
                return ptr;
            }
        }

        revert('allocate over max retry times');
    }

    function _findPtr(SkipList storage self, bytes memory key) internal view
    returns (_FindInfo memory)
    {
        _FindInfo memory info;

        uint32 prevPtr = NULL_PTR;
        for (uint l=MAX_LEVEL-1; l<MAX_LEVEL; l--) { // XXX: cause 'l' unsigned, use  `l<border` instead of `l>=0`
            for(
                uint32 ptr = self._map[prevPtr].forward[l];
                ptr != NULL_PTR;
                ptr = self._map[prevPtr].forward[l]
            ) {
                int code = __compare(self._map[ptr].key, key);

                if(code < 0) {
                    prevPtr = ptr;
                } else if (code == 0) {
                    info.ptr = ptr;
                    break;
                } else {
                    break;
                }
            }

            info.levelPtr[l] = prevPtr;
        }

        return info;
    }

    // -----------------------------------------
    function size(SkipList storage self) external view
    returns (uint)
    {
        return self._size;
    }
    
    function has(SkipList storage self, bytes calldata key) external view
    returns (bool) {
        _FindInfo memory info = _findPtr(self, key);

        return info.ptr != NULL_PTR;
    }

    function get(SkipList storage self, bytes calldata key) external view
    returns (bytes memory value)
    {
        _FindInfo memory info = _findPtr(self, key);

        return self._map[info.ptr].value;
    }

    function list(SkipList storage self, bytes calldata key, uint limit, bool reverse) external view
    returns (Pair[] memory)
    {
        uint32 ptr;

        // find nearest ptr
        _FindInfo memory info = _findPtr(self, key);
        if(info.ptr != NULL_PTR) {
            ptr = info.ptr;
        } else {
            uint32 prevPtr = info.levelPtr[0];

            if(reverse) {
                ptr = prevPtr;
            } else {
                ptr = self._map[prevPtr].forward[0];
            }
        }

        // list node ptr
        uint count = 0;
        uint32[] memory ptrArray = new uint32[](limit);
        for(count = 0; count<limit && ptr!=NULL_PTR; count++) {
            ptrArray[count] = ptr;

            if(reverse) {
                ptr = self._map[ptr].backward;
            } else {
                ptr = self._map[ptr].forward[0];
            }
        }

        // get key and value
        Pair[] memory array = new Pair[](count);
        for(uint i=0; i<count; i++) {
            array[i].key = self._map[ptrArray[i]].key;
            array[i].value = self._map[ptrArray[i]].value;
        }
        return array;
    }

    function set(SkipList storage self, bytes calldata key, bytes calldata value) external
    returns (bool)
    {
        require(key.length > 0, 'key can not be empty');

        _FindInfo memory info = _findPtr(self, key);

        // update exist node
        if(info.ptr != NULL_PTR) {
            self._map[info.ptr].value = value;
            return false;
        }

        // create new node
        uint32 newPtr = _allocPtr(self);
        _Node storage node = self._map[newPtr];
        node.key = key;
        node.value = value;
        self._size++;

        // link forward pointer
        uint level = _randomLevel(MAX_LEVEL, DENOMINATOR);
        for (uint l=0; l<level; l++) {
            _Node storage update = self._map[info.levelPtr[l]];

            node.forward[l] = update.forward[l];
            update.forward[l] = newPtr;
        }

        // link backward pointer
        node.backward = info.levelPtr[0];
        self._map[node.forward[0]].backward = newPtr;

        return true;
    }

    function del(SkipList storage self, bytes calldata key) external
    returns (bool)
    {
        _FindInfo memory info = _findPtr(self, key);

        // skip empty node
        if (info.ptr == NULL_PTR) {
            return false;
        }

        // link forward pointer
        _Node storage node = self._map[info.ptr];
        for (uint l = MAX_LEVEL-1; l<MAX_LEVEL; l--) {
            _Node storage update = self._map[info.levelPtr[l]];

            update.forward[l] = node.forward[l];
        }
        // link backward pointer
        self._map[node.forward[0]].backward = node.backward;

        // remove exist node
        delete self._map[info.ptr];
        self._size--;

        return true;
    }
}
