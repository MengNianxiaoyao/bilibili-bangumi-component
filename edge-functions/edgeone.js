const isMock = false

// ../bilibili-bangumi-component/src/shared/utils.ts
function serializeSearchParams(searchParams) {
  return Object.entries(searchParams).filter(([, value]) => !!value).map(([key, value]) => `${key}=${value}`).join("&");
}
function parseSearchParams(url) {
  return Object.fromEntries(Array.from(url.searchParams.entries()).filter(([, value]) => !!value));
}
function numberToZh(num) {
  const numString = num.toString();
  if (numString.length < 5)
    return numString;
  if (numString.length < 9) {
    const displayStr2 = numString.slice(0, -3);
    const length2 = displayStr2.length;
    const sub2 = displayStr2[length2 - 1] === "0" ? "" : `.${displayStr2[length2 - 1]}`;
    return `${displayStr2.slice(0, length2 - 1)}${sub2}\u4E07`;
  }
  const displayStr = numString.slice(0, -7);
  const length = displayStr.length;
  const sub = displayStr[length - 1] === "0" ? "" : `.${displayStr[length - 1]}`;
  return `${displayStr.slice(0, length - 1)}${sub}\u4EBF`;
}
function generateRes(params) {
  return Response.json(params, {
    status: params.code
  });
}

// ../bilibili-bangumi-component/src/shared/custom.ts
var customSubjectMap = {
  1: "anime",
  2: "game",
  3: "book"
};
var customCollectionMap = {
  1: "want",
  2: "doing",
  3: "done"
};
function customHandler(params, customData2) {
  const { subjectType = "1", collectionType = "0", pageNumber = 1, pageSize = 10 } = params;
  const collectionData = customData2[customSubjectMap[subjectType]];
  if (!collectionData)
    return generateEmpty(pageSize);
  let data;
  if (collectionType !== "0") {
    const list = collectionData[customCollectionMap[collectionType]];
    if (!list || !list.length)
      return generateEmpty(pageSize);
    data = list;
  } else {
    const list = Object.values(collectionData).flat();
    if (!list.length)
      return generateEmpty(pageSize);
    data = list;
  }
  return generateRes({
    code: 200,
    message: "ok",
    data: {
      list: data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
      pageNumber,
      pageSize,
      total: data.length,
      totalPages: Math.ceil(data.length / pageSize)
    }
  });
}
function generateEmpty(pageSize) {
  return generateRes({
    code: 200,
    message: "ok",
    data: {
      list: [],
      pageNumber: 1,
      pageSize,
      total: 0,
      totalPages: 1
    }
  });
}

// src/bilibili.ts
async function handler(query, env) {
  const { collectionType = "0", uid: paramsUid, pageNumber = "1", pageSize = "10" } = query;
  const vmid = paramsUid ?? env?.BILIBILI;
  if (!vmid) {
    return generateRes({
      code: 400,
      message: "uid is required",
      data: {}
    });
  }
  const searchParams = serializeSearchParams({
    type: 1,
    follow_status: collectionType,
    pn: pageNumber,
    ps: pageSize,
    vmid
  });
  const res = await fetch(`https://api.bilibili.com/x/space/bangumi/follow/list?${searchParams}`);
  const data = await res.json();
  if (!res.ok || data?.code !== 0) {
    return generateRes({
      code: 502,
      message: data.message,
      data: {}
    });
  }
  return generateRes({
    code: 200,
    message: "ok",
    data: handleFetchData(data.data)
  });
}
function handleFetchData(data) {
  const list = data?.list?.map((item) => {
    const labels = [
      {
        label: item?.new_ep?.index_show
      },
      {
        label: "\u8BC4\u5206",
        value: item?.rating?.score
      },
      {
        label: "\u64AD\u653E\u91CF",
        value: item?.stat?.view && numberToZh(item.stat.view)
      },
      {
        label: "\u8FFD\u756A\u6570",
        value: item?.stat?.follow && numberToZh(item.stat.follow)
      },
      {
        label: "\u6295\u5E01\u6570",
        value: item?.stat?.coin && numberToZh(item.stat.coin)
      },
      {
        label: "\u5F39\u5E55\u6570",
        value: item?.stat?.danmaku && numberToZh(item.stat.danmaku)
      }
    ];
    let cover = item.cover;
    if (cover && cover.startsWith("http:")) {
      const url = new URL(cover);
      url.protocol = "https:";
      cover = url.toString();
    }
    return {
      nameCN: item.title,
      summary: item.summary,
      cover,
      url: item.url,
      labels: labels.filter((item2) => item2.label)
    };
  });
  return {
    list: list ?? [],
    pageNumber: data.pn,
    pageSize: data.ps,
    total: data.total,
    totalPages: Math.ceil(data.total / data.ps)
  };
}

// src/bgm.ts
var subjectTypeMap = {
  1: "2",
  // 动画
  2: "4",
  // 游戏
  3: "1"
  // 书籍
};
var collectionTypeMap = {
  0: null,
  // 全部
  1: "1",
  // 想看
  2: "3",
  // 在看
  3: "2"
  // 看过
};
async function handler2(params, env) {
  const { subjectType = "1", uid: paramsUid, collectionType = "0", pageNumber = 1, pageSize = 10 } = params;
  const uid = paramsUid ?? env?.BGM;
  if (!uid) {
    return generateRes({
      code: 400,
      message: `uid is required`,
      data: {}
    });
  }
  const searchParams = serializeSearchParams({
    subject_type: subjectTypeMap[subjectType],
    type: collectionTypeMap[collectionType],
    limit: pageSize,
    offset: (Number(pageNumber) - 1) * Number(pageSize)
  });
  const res = await fetch(`https://api.bgm.tv/v0/users/${uid}/collections?${searchParams}`, {
    headers: {
      "User-Agent": `yixiaojiu/bilibili-bangumi-component (https://github.com/yixiaojiu/bilibili-bangumi-component)`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    return generateRes({
      code: 502,
      message: data.description,
      data: {}
    });
  }
  return generateRes({
    code: 200,
    message: "ok",
    data: handleFetchData2(data, { pageNumber: Number(pageNumber), pageSize: Number(pageSize) })
  });
}
function handleFetchData2(data, init) {
  const list = data?.data?.map((item) => {
    const subject = item?.subject;
    const labels = [
      {
        label: subject?.eps && `${subject.eps}\u8BDD`
      },
      {
        label: "\u8BC4\u5206",
        value: subject?.score
      },
      {
        label: "\u6392\u540D",
        value: subject?.rank
      },
      {
        label: "\u65F6\u95F4",
        value: subject?.date
      }
    ];
    return {
      name: subject?.name,
      nameCN: subject?.name_cn,
      summary: subject?.short_summary,
      cover: subject?.images?.large,
      url: subject?.id ? `https://bgm.tv/subject/${subject?.id}` : "https://bgm.tv/",
      labels: labels.filter((item2) => {
        if ("value" in item2)
          return item2.value;
        else
          return item2.label;
      })
    };
  });
  return {
    list: list ?? [],
    ...init,
    total: data.total,
    totalPages: Math.ceil(data.total / init.pageSize)
  };
}

// src/shared/utils.ts
function handleQuery(query) {
  const { pageNumber = 1, pageSize = 10 } = query;
  return {
    ...query,
    pageNumber: Number(pageNumber),
    pageSize: Number(pageSize)
  };
}

// src/edgeone.ts
async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const query = handleQuery(parseSearchParams(url));
  let customSource = {};
  try {
    customSource = customData;
  } catch {
  }
  if (url.pathname.endsWith("bilibili"))
    return await handler(query, env);
  else if (url.pathname.endsWith("bgm"))
    return await handler2(query, env);
  else if (url.pathname.endsWith("custom"))
    return customHandler(query, customSource);
  return Response.json({
    code: 404,
    message: "not found",
    data: {}
  }, { status: 404 });
}
export {
  onRequestGet
};
