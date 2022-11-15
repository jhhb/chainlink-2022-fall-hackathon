// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "hardhat/console.sol";

/**
 * @notice A Chainlink VRF consumer which uses randomness to mimic getting
 * a random answer from a Magic Eight Ball
 */

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK
 * faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

    struct Answer {
        string value;
        uint id;
    }

    struct Request {
        uint id;
        uint status; // ASK_STATUS_RUNNING, ASK_STATUS_RAN, or 0 by default.
        address user;
        string question;
        bool exists;
        string answerValue;
    }

contract RandomAnswer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private coordinator;
    uint8 constant private ASK_STATUS_RUNNING = 1;
    uint8 constant private ASK_STATUS_RAN = 2;

    uint64 private subscriptionId;
    bytes32 private keyHash;

    // Goerli coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    // bytes32 keyHash = 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 40,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 private callbackGasLimit = 40000 * 2 * 10;

    // The default is 3, but you can set this higher.
    uint16 private requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 private numWords = 1;

    // map request IDs to user address
    mapping(uint256 => address) private requestIdToAddress;
    mapping(address => uint256) private userAddressToStatus;
    mapping(address => uint256) private userAddressToResult;
    mapping(address => uint256) private userAddressToRequestIdentifier;

    mapping(address => uint[]) public userAddressToRequestIndices;
    Request[]  public allRequests;

    event QuestionAsked(uint256 indexed requestId, address indexed asker);
    event QuestionAnswered(uint256 indexed requestId, uint256 indexed asker);

    /**
     * @notice Constructor inherits VRFConsumerBaseV2
     *
     * @param _subscriptionId - the subscription ID that this contract uses for funding requests
     * @param vrfCoordinator - coordinator, check https://docs.chain.link/docs/vrf-contracts/#configurations
     * @param _keyHash - the gas lane to use, which specifies the maximum gas price to bump to
     */
    constructor(uint64 _subscriptionId, address vrfCoordinator, bytes32 _keyHash) VRFConsumerBaseV2(vrfCoordinator) {
        coordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    /**
     * @notice Requests randomness
     * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
     * as that would give miners/VRF operators latitude about which VRF response arrives first.
     * @dev You must review your implementation details with extreme care.
     */
    function askQuestion() public returns (uint256 requestId) {
        address asker = msg.sender;
        // If question is currently in progress for user, do not allow.
        require(userAddressToStatus[asker] != ASK_STATUS_RUNNING, "You must wait for your current question to be answered.");

        // TODO: JB - Need to handle this possible exception here, and in the client.
        // Will revert if subscription is not set and funded.
        requestId = coordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        requestIdToAddress[requestId] = asker;
        userAddressToStatus[asker] = ASK_STATUS_RUNNING;

        // It does not matter what this initial value is -- it just needs to be monotonically increasing.
        // The point of it is to give the frontend a way of uniquely ID-ing a change in the answer.
        uint initialIdValue = userAddressToRequestIdentifier[asker];
        userAddressToRequestIdentifier[asker] = initialIdValue + 1;

        allRequests.push(Request({id: userAddressToRequestIdentifier[asker], status: ASK_STATUS_RUNNING, user: asker, question: "question", exists: true, answerValue: "NO_ANSWER_RUNNING"}));
        userAddressToRequestIndices[asker].push(allRequests.length - 1);

        emit QuestionAsked(requestId, asker);
    }

    /**
     * @notice Callback function used by VRF Coordinator to return the random number to this contract.
     *
     * @dev Some action on the contract state should be taken here, like storing the result.
     * @dev WARNING: take care to avoid having multiple VRF requests in flight if their order of arrival would result
     * in contract states with different outcomes. Otherwise miners or the VRF operator would could take advantage
     * by controlling the order.
     * @dev The VRF Coordinator will only send this function verified responses, and the parent VRFConsumerBaseV2
     * contract ensures that this method only receives randomness from the designated VRFCoordinator.
     *
     * @param _requestId uint256
     * @param randomWords  uint256[] The random result returned by the oracle.
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory randomWords) internal override {
        // TODO: JB - May need handling for a non-existent request. However, I can"t figure out a way to test that
        // without trigerring a mock-side error.
        address userAddress = requestIdToAddress[_requestId];
        require(userAddressToStatus[userAddress] == ASK_STATUS_RUNNING);

        uint256 d20Value = (randomWords[0] % 20) + 1;

        userAddressToResult[userAddress] = d20Value;
        userAddressToStatus[userAddress] = ASK_STATUS_RAN;

        uint _latestRequestId = latestRequestId(userAddress);
        allRequests[_latestRequestId].status = ASK_STATUS_RAN;
        allRequests[_latestRequestId].answerValue = getAnswer(d20Value);

        emit QuestionAnswered(_requestId, d20Value);
    }

    /**
     * @notice Get the answer assigned to the user once the address has asked
     * @param userAddress address
     * @return answer as a string
     */
    function answer(address userAddress) public view returns (Answer memory) {
        if (userAddressToRequestIndices[userAddress].length == 0) {
                return makeAnswer(0, "NO_ANSWER_NONE");
        } else {
            uint256 latestId = latestRequestId(userAddress);
            Request memory latestRequest = allRequests[latestId];
            return makeAnswer(latestRequest.id, latestRequest.answerValue);
        }
    }

    function answers(address userAddress) public view returns (Answer[] memory) {
        if (userAddressToRequestIndices[userAddress].length == 0) {
            Answer[] memory _answers = new Answer[](1);
            _answers[0] = makeAnswer(0, "NO_ANSWER_NONE");
            return _answers;
        } else {
            return requestsToAnswers(userAddress);
        }
    }

    /**
     * @notice Get the answer from the value. Value is stored in a range from 1 to 20, inclusive.
     * @param idx uint256 ranges from 1 to 20, inclusive.
     * @return answer as a string
     */
    function getAnswer(uint256 idx) private pure returns (string memory) {
        string[20] memory staticAnswers = [
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes definitely.",
            "You may reloy on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        ];
        return staticAnswers[idx - 1];
    }

    function getUserStatus(address addr) public view returns (string memory) {
        uint256 status = userAddressToStatus[addr];
        return _getUserStatus(status);
    }

    function _getUserStatus(uint256 status) private pure returns (string memory) {
        string[3] memory statuses = [
            "NONE",
            "RUNNING",
            "RAN"
        ];
        return statuses[status];
    }

    function latestRequestId(address userAddress) private view returns (uint) {
        uint length = userAddressToRequestIndices[userAddress].length;
        uint _latestRequestId = userAddressToRequestIndices[userAddress][length - 1];
        return _latestRequestId;
    }

    function requestsToAnswers(address userAddress) private view returns (Answer[] memory) {
        uint[] memory requestIndices = userAddressToRequestIndices[userAddress];
        Answer[] memory _answers =  new Answer[](requestIndices.length);

        for (uint i = 0; i < requestIndices.length; i++) {
            uint requestIndex = requestIndices[i];
            Request memory _request = allRequests[requestIndex];
            _answers[i] = makeAnswer(_request.id, _request.answerValue);
        }
        return _answers;
    }

    function makeAnswer(uint256 id, string memory value) private pure returns (Answer memory) {
        return Answer({id: id, value: value});
    }
}
