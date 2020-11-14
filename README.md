# 군대간페페 디스코드 봇 설명서

## 0.왜 만들었는가

 바야흐로 코로나 발발 10개월이 지나고, 어떤 인간들은 밖에 나갈 수 없자 디스코드로 소통을 시작하게 되며 하루에 대부분을 디스코드와 함께 생활하게 되었다. 하지만, 그런 인간들도 결국 '군대'라는 곳에 하나 둘 끌려가버렸고, 갑작스럽게 생긴 인원 공백에 남은 인간들은 당황하기 시작했다. 즉, 공백으로 인해 발생한 심심함을 해소하기 위해 만들어진 것이 바로 이 군대간페페 봇인것이다.

 이 봇은 유저들이 쳤던 채팅을 분석해 일정한 시간 간격을 기준으로 블럭으로 묶어, 생겨난 수 많은 블럭들 중 특정 조건에 부합하는 메시지 블럭을 랜덤한 시간 간격으로 전송해주는 봇이다. 다만, 원래 개인용으로 쓰려고 만든 것이다 보니 구동하려면 좀 귀찮다. 간단히 요약하면 다음과 같다

>1. 디스코드 개발자 포털에 들어가서 봇 하나 만들기
>2. [여기서 자신이 속한 서버의 채팅을 txt로 바꾸기](https://github.com/Tyrrrz/DiscordChatExporter)
>3. 서버에 속한 사람들과 똑같이 생긴 웹훅 만들고, configuration파일에 등록하기
>4. configuration 파일 설정하기.
>5. 자기 컴퓨터에서 이 파일을 받아서 구동하기

이렇게 다섯 줄로 요약하니 별로 안귀찮아 보이긴 하는데, 나같으면 굳이 안할 것 같다. 하지만 굳이 해보려고 하는 자가 있다면 굳이 해봐도 좋다.

## 1.파일 설명

### A.  botConfig.json

 제일 중요하다. 얘를 설정 안하면 당신의 로컬에서 아예 돌아가지를 않을 것이다. 개발자 포털에 들어가서 봇 하나 만들고 토큰을 발급받아라. 그걸 이 파일에 {YOUR_TOKEN}에 넣으면 된다. 자세한건 구글이 알려줄 것이다. prefix는  모르면 건들지 말자.

### B.bot.js & chatParser.js

 이 봇의 메인 코드와 채팅을 봇이 읽을 수 있게 해주는 파서의 메인 코드다. 둘다 손 댈 필요도 ,가치도 없다. 가만히 두자.

### C. configuration.json - I

​	봇을 구동하기 위해서는 configuration파일 설정이 필수이다. 다만 이 설정은 굳이 건드리지 않아도 작동과는 무방하다.

```json
 "botSetting": {
     "maxTime": 3600, /* 채팅 "블록" 간의 딜레이를 정해주는 Interval의 최대 시간이다. 단위(초)*/
     "minTime": 0, /* " Interval의 최소 시간이다. 단위(초)*/
     "sendingIntervalTime": 30, /* 한 블록 안에 있는 채팅이 출력되는 기본 간격이다. 단위(초)*/
     "sendingRandomDelay": 10, /* " 출력되는 랜덤한 간격이다. 위의 변수와 함께, 출력되는 채팅은 30 ~ (30 + 10) 사이의 숫자 중 하나의 간격을 갖는다. 단위(초) */
     "sendingMode": 0, /*0일 때는 현재 채팅을 칠 수 없는 유저'가' 포함된 블록중 하나를 출력하는 모드이며, 1일때는 현재 채팅을 칠 수 없는 유저'만' 포함된 블록중 하나를 출력하는 모드가 된다. */
     "workingMode": 0, /*군인이 근무중이면 1, 근무중이 아니라면 0이다.*/
     "blockDelayMode": 0 /*위에서 본 minTime의 최소시간을 정해준다. 한 채팅 블록이 지나치게 길어 다음 블록이 출력될때 까지 출력되는 상황을 막기 위해서라도 minTime의 최소시간을 정하는것은 꼭 필요하다. 1이면 이 상황을 무조건 방지하는 minTime을 설정하고, 0이면 전체 블록의 평균 메시지 수에 비례해 minTime을 설정한다.*/
 }
```

``` json
"parserSetting": {
        "blockRange": 1 /*디스코드의 채팅로그는 초단위를 기록하지 않는다. 이 변수는 한 블록의 기준을 시간 차이 몇 분으로 할지를 정한다. 예를들어 지금처럼 1이면, 1분단위로 연속되어있는 채팅을 한 블록으로 지정한다. 1시 10분부터 1시 15분까지 1분마다 채팅이 있었다면, 이렇게 한 블록이 된다. 시간차이가 없는 채팅은 당연히 한 블록으로 포함된다.*/
    },
```

### D.configuration.json - II & chattxt/

 이 부분은 꼭 설정해주어야한다. 이를 설정하지 않는다면 봇의 구동은 불가능하다.

```json
"channelCode": {
        "{channelName1}": 1,
        "{channelName2}": 2
    },
    "userCode": {
        "{userName1}": "{userCode1}",
        "{userName2}": "{userCode2}",
        "{userName3}": "{userCode3}",
        "{userName4}": "{userCode4}",
        "{userName5}": "{userCode5}",
        "{userName6}": "{userCode6}"
    },
    "userState": {
        "{userCode1}": "{userState1}",
        "{userCode2}": "{userState2}",
        "{userCode3}": "{userState3}",
        "{userCode4}": "{userState4}",
        "{userCode5}": "{userState5}",
        "{userCode6}": "{userState6}",
        "undefined": 0
    },
"webHook": {
        "token1": {
            "{userCode1}": "{webHookArgs[0]1}",
            "undefined": "{webHookArgs[0]forUndefinedUserChat}"
        },
        "token2": {
            "{userCode1}": "{webHookArgs[1]1}",
            "undefined": "{webHookArgs[1]forUndefinedUserChat}"
        }
    }
```

* **channelCode**는, 말 그대로 채널 이름당 코드를 하나 부여하겠다는 것이다. 이유는 채널 이름은 보통 장문이기 때문에, 파싱된 텍스트에 그대로 들어가면 용량이 커지기 때문이다. 예를들어 채팅채널이 *채팅*폴더에 있는 *잡담*채널이라면, 이 부분에서는 *잡담*을 channelName에 넣고 임의의 코드를 부여해주면 된다. 구분만 될 수 있는 정도로만 정하자.

* **userCode**는, 채팅 서버에 존재하는 유저의 이름과 대응하는 임의의 코드를 정해주는 부분이다. 채팅을 [이 프로그램](https://github.com/Tyrrrz/DiscordChatExporter)으로 txt파일화 했다면,  채팅에 표시되는 유저명은 채널 내의 별명이 아닌, 디스코드 계정 이름+고유 태그로  보여질 것이다.  예를 들자면, 

  > [31-May-20 10:05 PM] LineNo2#2222
  > ㄹㅇㅋㅋ

  처럼 보여지는 것이다. **userCode**에서는 이 LineNo2#2222와 같은 고유 유저명을 더 간단한 코드로 바꾸는 일을 해야한다. 예를 들어 ```"LineNo2" : "LEE"``` 처럼 문자열도 좋고, ```"LineNo2" : 2``` 처럼 숫자도 상관 없다. 다만, 뒤에 설명할 봇 명령어 중 "!state list"명령에 의해 출력되는 모든 유저의 현재 상태는 당신이 설정한 userCode에 기반해 정해지기 때문에 구분은 되는 정도로 설정하는 것이 좋다. 참고로 LineNo2의 서버 별명이 "적폐세력"이고, "!state"명령어로 편하게 유저의 상태를 조회하고 싶으면 추가로 "적폐세력" : "LEE"을 추가해도 좋다.

* **userState**는, 위에서 정한 **userCode**에 상태를 부여하는 작업이다. 여기서 *userState*는 **무조건** 0, 1, 2 중의 정수로 설정해야한다. 얘를 들어 LineNo2#2222에 부여된 코드가 "LEE"고, 이 사람이 현재 민간인이라면 0을 적어주면 된다. ```"LEE" : 0``` 처럼 말이다. 0은 민간인, 2는 훈련병, 1은 병이다. 훈련병과 병을 굳이 구분한 이유는, 그 둘은 핸드폰의 사용 여부에서 차이가 있기 때문이다. **undefined**의 존재 이미는 아래에서 설명하겠다. 건들지 말자.

* **webHook**은 **token1**과 **token2** 두개를 설정해줘야한다. 디스코드 서버에서 커스텀 웹훅을 만들고 url 복사를 누르면, "https://discordapp.com/api/webhooks/{token1}/{token2}" 같은 링크를 준다. 당신이 직접 특정 유저를 닮은 웹훅을 만들고, 해당 웹훅을 저 token1, token2 부분을 잘 복사해 configuration파일에 붙여넣기한다면 이제 설정은 끝났다. 예를 들어, 위에도 등장한 LineNo2#2222의 유저코드 "LEE"가 있다면, 이 유저를 닮은 웹훅을 만들어 링크를 확인하고, ```"LEE":"Token1"``` , ```"LEE":"Token2"```처럼 각각 붙여넣자. 

* **undefined**는 왜있는가? 기본적으로 한 채널에서 운용할 수 있는 웹훅은 10개이다. 만약 채널 내에 유저가  10명이 넘어간다면, 모든 이를 웹훅으로 만들어 작동시키는 것은 불가능하다. 또한, **userCode**를 정할 때 모든 유저에 대해 유저코드를 정의하지 않았을 수도 있다. 이때 이 유저는 파싱될때 **undefined**로 파싱되며,  랜덤한 메시지 블록을 꺼낼때 이 유저가 들어있는 경우가 포함되어있을 수도 있다. 이때를 대비해서, **undefined**는 **userState**와 **webHook**에 각각 정의되어 있는 것이다. **userState**에 0으로 정의되어있는 이유는, 민간인 취급을 해 undefined가 포함되는 상황을 최소화 시키는 것에 있다. 또한 **webHook**에 정의되어어있고 따로 정의해야 하는 이유는, undefined를 출력할 때 webHook의 정의 안됨 오류에 인해서 봇이 죽어버리는 상황을 방지하기 위해서다.

## 2. 명령어

### A. !bot

> !bot start : 메시지 자동 출력을 켭니다. 
>
> !bot stop : 메시지 자동 출력을 끕니다.

### B. !state

> !state list 
> !state * : 모든 유저의 현재 상태를 확인합니다. configuration파일에 직접 정한 userCode 기반으로 출력됩니다.
> !state *userName* : 해당 유저의 현재 상태를 확인합니다.

### C. !interval

> !interval : 현재 interval을 조회합니다.

### D. !update

> !update yes : parser를 실행해 chattxt/ 경로에 있는 txt 파일을 파싱된 json으로 만들어줍니다.

### E. !mode

> !mode working : 현재 병들의 근무 여부를 확인합니다. 기본적으로 평일 18 ~ 22 시와 토, 일은 근무하지 않는 것으로 설정되어있습니다.
>
> !mode sending : 메시지 블록이 loose하게 골라졌는지, strict하게 골라졌는지 확인합니다. 위에서 설명 했습니다.
>
> !mode blockdelay : 마찬가지로 위의 **configuration**의 blockDelayMode에서 설명한 바 있습니다.

### F. !help & !set

> !help
>
> !set help : 이를 통해 자세한 명령을 확인할 수 있습니다.
