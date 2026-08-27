  const joinFamily = async (code, userOverride) => {
    const user = userOverride || authUser;
    const { family: fam, isNew } = await createFamilyIfMissing(code);
    const mem = await getOrCreateMember(code, user, isNew);
    setFamily(fam); setMember(mem); setMode("family");
  };
