// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VouchRegistry {
    enum Verdict {
        Safe,
        Suspicious,
        Malicious
    }

    enum Status {
        Active,
        Challenged,
        Upheld,
        Overturned,
        Revoked
    }

    struct Auditor {
        uint256 stake;
        uint256 reputation;
        string metadataURI;
        bool active;
    }

    struct Attestation {
        address auditor;
        bytes32 packageKey;
        Verdict verdict;
        uint8 riskScore;
        bytes32 reportHash;
        string reportURI;
        uint64 timestamp;
        Status status;
    }

    struct Challenge {
        uint256 attestationId;
        address challenger;
        uint256 bond;
        string evidenceURI;
        bool resolved;
    }

    uint256 public immutable minStake;
    uint256 public immutable challengeBond;
    uint256 public immutable slashBps;
    address public arbiter;
    uint256 public exitCooldown = 1 minutes;

    mapping(address => Auditor) public auditors;
    mapping(address => uint256) public exitAfter;
    mapping(bytes32 => uint256[]) private attestationsByPackage;
    mapping(bytes32 => bool) private attestedByAuditor;
    mapping(address => uint256) public pendingWithdrawals;

    Attestation[] public attestations;
    Challenge[] public challenges;

    event AuditorRegistered(address indexed auditor, string metadataURI, uint256 stake);
    event StakeAdded(address indexed auditor, uint256 amount);
    event Attested(uint256 indexed id, address indexed auditor, bytes32 indexed packageKey, string name, string version, Verdict verdict, uint8 riskScore, bytes32 reportHash, string reportURI);
    event Revoked(uint256 indexed id);
    event Challenged(uint256 indexed id, uint256 indexed challengeId, address indexed challenger);
    event ChallengeResolved(uint256 indexed challengeId, bool upheld);
    event Withdrawn(address indexed account, uint256 amount);

    constructor(uint256 _minStake, uint256 _challengeBond, uint256 _slashBps) {
        minStake = _minStake;
        challengeBond = _challengeBond;
        slashBps = _slashBps;
        arbiter = msg.sender;
    }

    function registerAuditor(string calldata metadataURI) external payable {
        require(msg.value >= minStake, "stake too low");
        Auditor storage auditor = auditors[msg.sender];
        require(!auditor.active, "already active");
        auditor.stake += msg.value;
        auditor.reputation = 1;
        auditor.metadataURI = metadataURI;
        auditor.active = true;
        emit AuditorRegistered(msg.sender, metadataURI, msg.value);
    }

    function addStake() external payable {
        require(auditors[msg.sender].active, "not auditor");
        auditors[msg.sender].stake += msg.value;
        emit StakeAdded(msg.sender, msg.value);
    }

    function requestExit() external {
        require(auditors[msg.sender].active, "not auditor");
        exitAfter[msg.sender] = block.timestamp + exitCooldown;
    }

    function exit() external {
        require(exitAfter[msg.sender] != 0 && block.timestamp >= exitAfter[msg.sender], "cooldown");
        Auditor storage auditor = auditors[msg.sender];
        uint256 amount = auditor.stake;
        auditor.stake = 0;
        auditor.active = false;
        pendingWithdrawals[msg.sender] += amount;
    }

    function attest(bytes32 packageKey, string calldata name, string calldata version, Verdict verdict, uint8 riskScore, bytes32 reportHash, string calldata reportURI) external returns (uint256 id) {
        require(auditors[msg.sender].active, "not auditor");
        require(riskScore <= 100, "bad score");
        bytes32 unique = keccak256(abi.encode(msg.sender, packageKey));
        require(!attestedByAuditor[unique], "duplicate");
        id = attestations.length;
        attestations.push(Attestation(msg.sender, packageKey, verdict, riskScore, reportHash, reportURI, uint64(block.timestamp), Status.Active));
        attestationsByPackage[packageKey].push(id);
        attestedByAuditor[unique] = true;
        auditors[msg.sender].reputation += 1;
        emit Attested(id, msg.sender, packageKey, name, version, verdict, riskScore, reportHash, reportURI);
    }

    function revoke(uint256 id) external {
        Attestation storage item = attestations[id];
        require(item.auditor == msg.sender, "not owner");
        item.status = Status.Revoked;
        emit Revoked(id);
    }

    function challenge(uint256 id, string calldata evidenceURI) external payable {
        require(msg.value >= challengeBond, "bond too low");
        Attestation storage item = attestations[id];
        require(item.status == Status.Active, "not active");
        item.status = Status.Challenged;
        challenges.push(Challenge(id, msg.sender, msg.value, evidenceURI, false));
        emit Challenged(id, challenges.length - 1, msg.sender);
    }

    function resolveChallenge(uint256 challengeId, bool upheld) external {
        require(msg.sender == arbiter, "not arbiter");
        Challenge storage item = challenges[challengeId];
        require(!item.resolved, "resolved");
        Attestation storage attestation = attestations[item.attestationId];
        item.resolved = true;
        if (upheld) {
            uint256 slash = (auditors[attestation.auditor].stake * slashBps) / 10_000;
            auditors[attestation.auditor].stake -= slash;
            auditors[attestation.auditor].reputation = auditors[attestation.auditor].reputation > 10 ? auditors[attestation.auditor].reputation - 10 : 0;
            pendingWithdrawals[item.challenger] += item.bond + slash;
            attestation.status = Status.Upheld;
        } else {
            pendingWithdrawals[attestation.auditor] += item.bond;
            attestation.status = Status.Overturned;
        }
        emit ChallengeResolved(challengeId, upheld);
    }

    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "nothing");
        pendingWithdrawals[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    function getAttestationIds(bytes32 packageKey) external view returns (uint256[] memory) {
        return attestationsByPackage[packageKey];
    }

    function getAttestation(uint256 id) external view returns (Attestation memory) {
        return attestations[id];
    }

    function getAuditor(address account) external view returns (Auditor memory) {
        return auditors[account];
    }

    function getChallenge(uint256 id) external view returns (Challenge memory) {
        return challenges[id];
    }
}

