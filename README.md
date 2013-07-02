* 概要

    死にたさを主張する Tweet を収集。
    Twitter API 1.1のStreamで取得したTweetのJSON構造を
    MongoDBの保存

* 依存関係

    * Node.js v0.10.12
    * MongoDB 2.4.4
    * mtwitter 1.5.2
    * mongoose 3.6.13"
    
* TODO 
    * Json Parse Errorが発生することがある
      改行コードの回避か