import { expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { RandomAnswer, VRFCoordinatorV2Mock } from "../../typechain";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomAnswer Unit Tests", async function () {
          let vrfConsumer: RandomAnswer;
          let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
          let askQuestionInput = "ask-question-input";

          describe("#askQuestion", async () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"]);
                  vrfConsumer = await ethers.getContract("RandomAnswer");

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
              });

              it("Should successfully request a random number", async () => {
                  const [account1] = await ethers.getSigners();

                  await expect(vrfConsumer.askQuestion(askQuestionInput))
                      .to.emit(vrfConsumer, "QuestionAsked")
                      .withArgs(1, account1.address);
              });

              it("Disallows multiple in-flight requests for the same address", async () => {
                  const [account1] = await ethers.getSigners();

                  await expect(vrfConsumer.askQuestion(askQuestionInput))
                      .to.emit(vrfConsumer, "QuestionAsked")
                      .withArgs(1, account1.address);

                  await expect(vrfConsumer.askQuestion(askQuestionInput)).to.be.revertedWith(
                      "You must wait for your current question to be answered."
                  );
              });

              it("Allows two different users to make multiple requests, with no fulfillment, without error", async () => {
                  const [account1, account2] = await ethers.getSigners();

                  await expect(vrfConsumer.connect(account1).askQuestion(askQuestionInput))
                      .to.emit(vrfConsumer, "QuestionAsked")
                      .withArgs(1, account1.address);

                  await expect(vrfConsumer.connect(account2).askQuestion(askQuestionInput))
                      .to.emit(vrfConsumer, "QuestionAsked")
                      .withArgs(2, account2.address);
              });

              it("Allows additional requests by the same address after the prior one has completed", async () => {
                  const [account1] = await ethers.getSigners();
                  await vrfConsumer.askQuestion(askQuestionInput);

                  const firstRequestId = 1;
                  const transformedResult = 2;

                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(firstRequestId, vrfConsumer.address)
                  )
                      .to.emit(vrfConsumer, "QuestionAnswered")
                      .withArgs(firstRequestId, transformedResult);

                  await expect(vrfConsumer.askQuestion(askQuestionInput))
                      .to.emit(vrfConsumer, "QuestionAsked")
                      .withArgs(2, account1.address);

                  await expect(vrfCoordinatorV2Mock.fulfillRandomWords(2, vrfConsumer.address))
                      .to.emit(vrfConsumer, "QuestionAnswered")
                      .withArgs(2, 2);
              });

              describe("question input validation", async () => {
                  it("Reverts for invalid inputs", async () => {
                      await expect(vrfConsumer.askQuestion("")).to.be.revertedWith(
                          "You must input a question between 1 and 60 characters."
                      );

                      const longArray = new Array(61);
                      const longString = longArray.map((el) => "c").join("");
                      await expect(vrfConsumer.askQuestion(longString)).to.be.revertedWith(
                          "You must input a question between 1 and 60 characters."
                      );
                  });
              });

              describe("security properties", async () => {
                  it("Allows the signer to call the function", async () => {
                      const [account1] = await ethers.getSigners();

                      expect(await vrfConsumer.signer.getAddress()).to.eq(account1.address);
                      await expect(
                          vrfConsumer.connect(account1).askQuestion(askQuestionInput)
                      ).to.emit(vrfConsumer, "QuestionAsked");
                  });

                  it("Allows other addresses to call the function", async () => {
                      const [_account1, account2] = await ethers.getSigners();

                      expect(await vrfConsumer.signer.getAddress()).to.not.eq(account2.address);
                      await expect(
                          vrfConsumer.connect(account2).askQuestion(askQuestionInput)
                      ).to.emit(vrfConsumer, "QuestionAsked");
                  });
              });
          });

          describe("#fulfillRandomWords", async () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"]);
                  vrfConsumer = await ethers.getContract("RandomAnswer");

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
              });

              it("emits the expected events even when fulfillments occur out of order", async () => {
                  const [account1, account2] = await ethers.getSigners();

                  await vrfConsumer.connect(account1).askQuestion(askQuestionInput);

                  await vrfConsumer.connect(account2).askQuestion(askQuestionInput);

                  const secondRequestFulfillmentArgs = { requestId: 2, value: 2 };
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(
                          secondRequestFulfillmentArgs.requestId,
                          vrfConsumer.address
                      )
                  )
                      .to.emit(vrfConsumer, "QuestionAnswered")
                      .withArgs(
                          secondRequestFulfillmentArgs.requestId,
                          secondRequestFulfillmentArgs.value
                      );

                  const firstRequestFulfillmentArgs = { requestId: 1, value: 2 };
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(
                          firstRequestFulfillmentArgs.requestId,
                          vrfConsumer.address
                      )
                  )
                      .to.emit(vrfConsumer, "QuestionAnswered")
                      .withArgs(
                          firstRequestFulfillmentArgs.requestId,
                          secondRequestFulfillmentArgs.value
                      );
              });

              it("allows the user to ask again on fulfillment", async () => {
                  const [account1] = await ethers.getSigners();

                  await vrfConsumer.connect(account1).askQuestion(askQuestionInput);

                  await expect(
                      vrfConsumer.connect(account1).askQuestion(askQuestionInput)
                  ).to.be.revertedWith("You must wait for your current question to be answered.");

                  const initialRequestId = 1;
                  const expectedRandomValue = 2;
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(initialRequestId, vrfConsumer.address)
                  )
                      .to.emit(vrfConsumer, "QuestionAnswered")
                      .withArgs(initialRequestId, expectedRandomValue);

                  const secondRequestId = 2;
                  await expect(vrfConsumer.connect(account1).askQuestion(askQuestionInput))
                      .to.emit(vrfConsumer, "QuestionAsked")
                      .withArgs(secondRequestId, account1.address);
              });
          });

          describe("#answer", () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"]);
                  vrfConsumer = await ethers.getContract("RandomAnswer");

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
              });

              describe("success", () => {
                  it("returns a value after randomness has been fulfilled for the requested address", async () => {
                      const [account1] = await ethers.getSigners();
                      await vrfConsumer.connect(account1).askQuestion(askQuestionInput);
                      await vrfCoordinatorV2Mock.fulfillRandomWords(1, vrfConsumer.address);

                      const result = await vrfConsumer.connect(account1).answer(account1.address);

                      expect(result.value).to.eq("It is decidedly so.");
                      expect(result.id).to.eq(1);
                  });

                  it("allows the sender to run the function for other addresses", async () => {
                      const [accountWithResult, account2] = await ethers.getSigners();
                      await vrfConsumer.connect(accountWithResult).askQuestion(askQuestionInput);
                      await vrfCoordinatorV2Mock.fulfillRandomWords(1, vrfConsumer.address);

                      const result = await vrfConsumer
                          .connect(account2)
                          .answer(accountWithResult.address);
                      expect(result.value).to.eq("It is decidedly so.");
                      expect(result.id).to.eq(1);
                  });

                  it("returns a special value if no address has been recorded for the input address", async () => {
                      const [account1] = await ethers.getSigners();
                      const result = await vrfConsumer.connect(account1).answer(account1.address);
                      expect(result.value).to.eq("NO_ANSWER_NONE");
                      expect(result.id).to.eq(0);
                  });

                  it("allows the parameterized address to ask even if an answer is not yet available", async () => {
                      const [account1] = await ethers.getSigners();
                      await vrfConsumer.connect(account1).askQuestion(askQuestionInput);

                      const result = await vrfConsumer.connect(account1).answer(account1.address);
                      expect(result.value).to.eq("NO_ANSWER_RUNNING");
                      expect(result.id).to.eq(1);
                  });
              });
          });

          describe("#getUserStatus", () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"]);
                  vrfConsumer = await ethers.getContract("RandomAnswer");

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
              });

              context("for each state transition", () => {
                  it("returns the expected value", async () => {
                      const [_account1, account2] = await ethers.getSigners();

                      const result = await vrfConsumer
                          .connect(account2)
                          .getUserStatus(account2.address);
                      expect(result).to.be.eq("NONE");

                      await vrfConsumer.connect(account2).askQuestion(askQuestionInput);

                      const resultAfterAsking = await vrfConsumer
                          .connect(account2)
                          .getUserStatus(account2.address);
                      expect(resultAfterAsking).to.be.eq("RUNNING");

                      await vrfCoordinatorV2Mock.fulfillRandomWords(1, vrfConsumer.address);

                      const resultAfterFulfill = await vrfConsumer
                          .connect(account2)
                          .getUserStatus(account2.address);
                      expect(resultAfterFulfill).to.be.eq("RAN");

                      await vrfConsumer.connect(account2).askQuestion(askQuestionInput);
                      const resultAfterAskingAgain = await vrfConsumer
                          .connect(account2)
                          .getUserStatus(account2.address);
                      expect(resultAfterAskingAgain).to.be.eq("RUNNING");
                  });
              });
          });

          describe("#answers", async () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "randomAnswer"]);
                  vrfConsumer = await ethers.getContract("RandomAnswer");

                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
              });

              it("Returns the expected value when there is no answer for the user", async () => {
                  const [account1] = await ethers.getSigners();

                  const answers = await vrfConsumer.connect(account1).answers(account1.address);
                  expect(answers.length).to.eq(1);
                  expect(answers[0].value).to.eq("NO_ANSWER_NONE");
                  expect(answers[0].id).to.eq(0);
              });

              it("Returns the expected result throughout the lifecycle", async () => {
                  const [account1] = await ethers.getSigners();

                  await vrfConsumer.connect(account1).askQuestion(askQuestionInput);

                  let answers = await vrfConsumer.connect(account1).answers(account1.address);
                  expect(answers.length).to.eq(1);
                  expect(answers[0].id).to.eq(1);
                  expect(answers[0].value).to.eq("NO_ANSWER_RUNNING");

                  await vrfCoordinatorV2Mock.fulfillRandomWords(1, vrfConsumer.address);

                  answers = await vrfConsumer.connect(account1).answers(account1.address);
                  expect(answers.length).to.eq(1);

                  const { value, id } = answers[0];
                  expect(value).to.be.eq("It is decidedly so.");
                  expect(id).to.be.eq(1);

                  await vrfConsumer.connect(account1).askQuestion(askQuestionInput);
                  answers = await vrfConsumer.connect(account1).answers(account1.address);
                  expect(answers.length).to.eq(2);
                  const [first, second] = answers;
                  expect(first.id).to.eq(1);
                  expect(first.value).to.eq("It is decidedly so.");

                  expect(second.id).to.eq(2);
                  expect(second.value).to.eq("NO_ANSWER_RUNNING");
              });
          });

          // TODO: JB - Need to see more examples to make sure this is working.
          describe("Deployment", async () => {
              it("emits the expected event", async () => {});
          });
      });
