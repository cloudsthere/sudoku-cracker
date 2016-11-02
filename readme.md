### Sudoku Cracker
数独破解程序，详见[数独终结者](https://cloudsthere.github.io/sudoku-cracker/)

#### 用法

```
// 四维数组, 每维三个元素， draft[0][0][0][0]表示R1C1的值, [2][0][1][2]表示R8C3
var draft = [
    [
        [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ],
        // ...
    ],
    // ...
]
// 输入数据
cracker.init(draft)

// 扫描, 如果运行成功，返回一个五维数组，否则返回false，下同
var res = cracker.scan()

// 破解
var res = cracker.solve()


```