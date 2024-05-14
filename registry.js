const Registry = artifacts.require("Registry")
contract("Registry", (accounts) => {
  let registryInstance;

  before(async () => {
    registryInstance = await Registry.deployed();
  });
  it("should deploy the smart contract properly", async () => {
     assert(registryInstance.address != "");
  });
  it("should add a new admin", async () => {
    const adminAddr = accounts[1];
    const state = "UP";
    const district = "Allahabad";
    const city = "Meja";

     await registryInstance.addAdmin(adminAddr, state, district, city);

     const newAdmin = await registryInstance.admins(adminAddr);

     assert.equal(
      newAdmin.adminAddress,
      adminAddr,
      "Admin address should match"
    );
    assert.equal(newAdmin.state, state, "State should match");
    assert.equal(newAdmin.district, district, "District should match");
    assert.equal(newAdmin.city, city, "City should match");
  });
});
 
contract("Registry", (accounts) => {
  let registryInstance;
  const adminAddr = accounts[1];
  const state = "UP";
  const district = "Allahabad";
  const city = "Meja";
  const propertyId = 1;
  const surveyNo = 123;
  const ownerAddr = accounts[2];
  const marketValue = 100000;
  const sqft = 1000;

  before(async () => {
    registryInstance = await Registry.new();  
  });

  it("should register land successfully", async () => {
     await registryInstance.addAdmin(adminAddr, state, district, city);

     await registryInstance.registerLand(
      state,
      district,
      city,
      propertyId,
      surveyNo,
      ownerAddr,
      marketValue,
      sqft,
      { from: adminAddr }
    );

     const newLand = await registryInstance.landDetalsMap(
      state,
      district,
      city,
      surveyNo
    );

     const ownerLand = await registryInstance.ownerMapsProperty(ownerAddr, 0);  

     assert.equal(newLand.owner, ownerAddr, "Owner address should match");
    assert.equal(newLand.admin, adminAddr, "Admin address should match");
    assert.equal(
      newLand.propertyId.toNumber(),
      propertyId,
      "Property ID should match"
    );
    assert.equal(
      newLand.surveyNumber.toNumber(),
      surveyNo,
      "Survey number should match"
    );
    assert.equal(newLand.registered, true, "Land should be registered");
    assert.equal(
      newLand.marketValue.toNumber(),
      marketValue,
      "Market value should match"
    );
    assert.equal(
      newLand.markAvailable,
      false,
      "Mark availability should be false"
    );
    assert.equal(newLand.sqft.toNumber(), sqft, "Square footage should match");

     assert.equal(
      ownerLand.surveyNumber.toNumber(),
      surveyNo,
      "Survey number should match"
    );
    assert.equal(ownerLand.state, state, "State should match");
    assert.equal(ownerLand.district, district, "District should match");
    assert.equal(ownerLand.city, city, "City should match");

     const userProfile = await registryInstance.userProfile(ownerAddr);
    assert.equal(
      userProfile.totalIndices.toNumber(),
      1,
      "totalIndices should increment by 1"
    );
  });

  it("should not register land if admin is not from the same city", async () => {
    const wrongAdminAddr = accounts[3];
    const wrongCity = "Allahabad";

     await registryInstance.addAdmin(wrongAdminAddr, state, district, wrongCity);

     try {
      await registryInstance.registerLand(
        state,
        district,
        city,
        propertyId,
        surveyNo,
        ownerAddr,
        marketValue,
        sqft,
        { from: wrongAdminAddr }
      );
      assert.fail("Exception should be thrown");
    } catch (error) {
      assert(
        error.message.includes("Admin can only register land of same city."),
        "Wrong error message"
      );
    }
  });

  it("should not register land if survey number is already registered", async () => {
     try {
      await registryInstance.registerLand(
        state,
        district,
        city,
        propertyId,
        surveyNo,
        ownerAddr,
        marketValue,
        sqft,
        { from: adminAddr }
      );
      assert.fail("Exception should be thrown");
    } catch (error) {
      assert(
        error.message.includes("Survey Number already registered!"),
        "Wrong error message"
      );
    }
  });
});

 
contract("Registry", (accounts) => {
  let registryInstance;
  const ownerAddr = accounts[1];
  const indexNo = 0;  
  const state = "UP";
  const adminAddr = accounts[4];
  const district = "Allahabad";
  const city = "Meja";
  const surveyNo = 123;

  before(async () => {
    registryInstance = await Registry.new();  
    await registryInstance.addAdmin(adminAddr, state, district, city);

     await registryInstance.registerLand(
      state,
      district,
      city,
      1, // propertyId
      surveyNo,
      ownerAddr,
      100000, // marketValue
      1000, // sqft
      { from: adminAddr} 
    );
  });

  it("should mark the property as available", async () => {
     await registryInstance.markMyPropertyAvailable(indexNo, {
      from: ownerAddr,
    });

     const updatedLand = await registryInstance.landDetalsMap(
      state,
      district,
      city,
      surveyNo
    );

     assert.equal(
      updatedLand.markAvailable,
      true,
      "Property should be marked as available"
    );
  });

  it("should not mark the property as available if already marked", async () => {
     try {
      await registryInstance.markMyPropertyAvailable(indexNo, {
        from: ownerAddr,
      });
      assert.fail("Exception should be thrown");
    } catch (error) {
      assert(
        error.message.includes("Property already marked available"),
        "Wrong error message"
      );
    }
  });
});

 
 
 contract("Registry", (accounts) => {
   let registryInstance;
   const state = "UP";
   const district = "Allahabad";
   const city = "Meja";
   const surveyNo = 123;
   const propertyId = 1;
   const marketValue = 100000;
   const sqft = 1000;

   before(async () => {
     registryInstance = await Registry.new();  
     await registryInstance.addAdmin(accounts[1], state, district, city);

      await registryInstance.registerLand(
       state,
       district,
       city,
       propertyId,
       surveyNo,
       accounts[2],  
       marketValue,
       sqft,
       { from: accounts[1] }  
     );
   });

   it("should return the correct land details", async () => {
      const landDetails = await registryInstance.getLandDetails(
       state,
       district,
       city,
       surveyNo
     );

      const returnedOwner = landDetails[0];
     const returnedPropertyId = landDetails[1].toNumber();
     const returnedIndex = landDetails[2].toNumber();
     const returnedMarketValue = landDetails[3].toNumber();
     const returnedSqft = landDetails[4].toNumber();

      assert.equal(returnedOwner, accounts[2], "Owner address should match");
     assert.equal(returnedPropertyId, propertyId, "Property ID should match");
     assert.equal(returnedIndex, 0, "Index should match");
     assert.equal(
       returnedMarketValue,
       marketValue,
       "Market value should match"
     );
     assert.equal(returnedSqft, sqft, "Square footage should match");
   });
 });

 
contract("Registry", (accounts) => {
  let registryInstance;
  const adminAddr = accounts[1];
  const state = "UP";
  const district = "Allahabad";
  const city = "Meja";
  const surveyNo = 123;
  const propertyId = 1;

  before(async () => {
    registryInstance = await Registry.new();  
     await registryInstance.addAdmin(accounts[1], state, district, city);

     await registryInstance.registerLand(
      state,
      district,
      city,
      propertyId,
      surveyNo,
      accounts[2],  
      100000, // marketValue
      1000, // sqft
      { from: adminAddr }
    );
  });

  it("should return the correct request count and property ID", async () => {
     const result = await registryInstance.getRequestCnt_propId(
      state,
      district,
      city,
      surveyNo
    );

     const noOfRequests = result[0].toNumber();
    const returnedPropertyId = result[1].toNumber();

     assert.equal(noOfRequests, 0, "Number of requests should be 0");
    assert.equal(returnedPropertyId, propertyId, "Property ID should match");
  });
});

 
contract("Registry", (accounts) => {
  let registryInstance;
  const state = "UP";
  const district = "Allahabad";
  const city = "Meja";
  const surveyNo = 123;
  const propertyId = 1;

  before(async () => {
    registryInstance = await Registry.new(); 
     await registryInstance.addAdmin(accounts[1], state, district, city);

     await registryInstance.registerLand(
      state,
      district,
      city,
      propertyId,
      surveyNo,
      accounts[0],  
      100000, // marketValue
      1000, // sqft
      { from: accounts[1] }  
    );
  });

  it("should return the correct land details owned by the caller", async () => {
     const landDetails = await registryInstance.getOwnerOwns(0, {
      from: accounts[0],
    });

     const returnedState = landDetails[0];
    const returnedDistrict = landDetails[1];
    const returnedCity = landDetails[2];
    const returnedSurveyNo = landDetails[3].toNumber();

     assert.equal(returnedState, state, "State should match");
    assert.equal(returnedDistrict, district, "District should match");
    assert.equal(returnedCity, city, "City should match");
    assert.equal(returnedSurveyNo, surveyNo, "Survey number should match");
  });
});
