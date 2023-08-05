#红黑树部分(第一部分)
###红黑树的性质：
>-  根结点是黑色的
>- 每个节点，不是黑色的就是红色的
>- 每个叶子结点（每个根结点为null或nil节点）都是黑色的
>- 每个红色节点的孩子节点为黑色节点
>- 每个红色节点，到*其叶子节点*的路径，经过相同的黑色节点


红黑树是一种二叉查找树，
###红黑树的查找
>- 树的查找，是树插入、删除的核心；是否能够快速的查找到树，决定了红黑树插入和删除的效率
>- 红黑树的查找，参考二叉平衡树的查找；同时，hashmap中的红黑树按照hash值的大小进行插入
![红黑树查找流程图.png](https://upload-images.jianshu.io/upload_images/5294752-851bb334036646e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#####红黑树查找
````
         /**
         * Finds the node starting at root p with the given hash and key.
         * The kc argument caches comparableClassFor(key) upon first use
         * comparing keys.
         */
       //  h，被查找值的hash值，被查找的key，key的class
        final TreeNode<K,V> find(int h, Object k, Class<?> kc) {
            TreeNode<K,V> p = this;
      //  这是一个do-while循环，root=p开始查找
            do {
                int ph, dir; K pk;
                TreeNode<K,V> pl = p.left, pr = p.right, q;
                if ((ph = p.hash) > h)
//  如果ph的值大于h，则p=pl遍历左子树
                    p = pl;
                else if (ph < h)
//  如果ph的值小于h，则p=pl遍历右子树
                    p = pr;
                else if ((pk = p.key) == k || (k != null && k.equals(pk)))
//如果p.key== k|| 或者k.equals(pk)&&k!=null
                    return p;
                else if (pl == null)
//  如果左子树为空，直接遍历右子树
                    p = pr;
                else if (pr == null)
                    p = pl;
//注意代码运行到这里，hash值相同，且key值不相同；
                else if ((kc != null ||
                          (kc = comparableClassFor(k)) != null) &&
                         (dir = compareComparables(kc, k, pk)) != 0)
//kc comparableClassFor 如果属性 x implements (x)，可以进行比较,是可以进行比较的类
                    p = (dir < 0) ? pl : pr;
//如果节点包装类，不能进行比较，则遍历查找右子树；直至遍历到链表尾部；
                else if ((q = pr.find(h, k, kc)) != null)
                    return q;
//否则查找左子树
                else
                    p = pl;
            } while (p != null);
            return null;
        }
````
####上述精妙之处，也是看代码困惑的地方
>- comparableClassFor与compareComparables的使用;第一个方法是判断该entry中K对应的包装类，是否能够实现了class <?> comparable<K v>接口(class C implements  Comparable<C>);第二个方法： compareComparables 比较两个k h的值，如果h比h小，则遍历左子树，否则右子树
>- (q = pr.find(h, k, kc)) != null 执行这句的前提是，p的key和当前节点key不相同；同时p的key的包装类不能比较大小；则需要将p左右的子树遍历一遍；先将右子树遍历完，如果找到停止，否则遍历左子树


###红黑树的插入
####红黑树插入的方法，类似于find的方法；

```
         /**
         * Tree version of putVal.
         */
        final TreeNode<K,V> putTreeVal(HashMap<K,V> map, Node<K,V>[] tab,
                                       int h, K k, V v) {
            Class<?> kc = null;
            boolean searched = false;
//找到treeNode的根结点parent=root()；
            TreeNode<K,V> root = (parent != null) ? root() : this;
            for (TreeNode<K,V> p = root;;) {
                int dir, ph; K pk;
//dir是子树的遍历方向，h比p（游标）的hash值小，则dir为-1；
                if ((ph = p.hash) > h)
                    dir = -1;
                else if (ph < h)
                    dir = 1;
                else if ((pk = p.key) == k || (k != null && k.equals(pk)))
//找到了该节点，直接返回
                    return p;
                else if ((kc == null &&
                          (kc = comparableClassFor(k)) == null) ||
                         (dir = compareComparables(kc, k, pk)) == 0) {
//如果包装类没有实现comparale接口；判断该子树有没有搜索过；如果没有，继续
                    if (!searched) {
                        TreeNode<K,V> q, ch;
                        searched = true;
                        if (((ch = p.left) != null &&
                             (q = ch.find(h, k, kc)) != null) ||
                            ((ch = p.right) != null &&
                             (q = ch.find(h, k, kc)) != null))
//将左右子树遍历完成，找到直接返回；
                            return q;
                    }
//如果实现过comparale 接口；
                    dir = tieBreakOrder(k, pk);
                }
                TreeNode<K,V> xp = p;
                if ((p = (dir <= 0) ? p.left : p.right) == null) {
//找到了节点需要插入的节点；当p为空，找到p需要插入的位置
                    Node<K,V> xpn = xp.next;
                    TreeNode<K,V> x = map.newTreeNode(h, k, v, xpn);
//新建节点xpn，如果dir小于等于0,则插入p的左子树
                    if (dir <= 0)
                        xp.left = x;
                    else
//否则插入右子树
                        xp.right = x;
//先xp的next为x,x的parent以及prev为xp；
                    xp.next = x;
                    x.parent = x.prev = xp;
                    if (xpn != null)
                        ((TreeNode<K,V>)xpn).prev = x;
  // 平衡红黑树并保证root是index处首节点
                    moveRootToFront(tab, balanceInsertion(root, x));
                    return null;
                }
            }
        }
````
###红黑树的删除
```
/**
         * Removes the given node, that must be present before this call.
         * This is messier than typical red-black deletion code because we
         * cannot swap the contents of an interior node with a leaf
         * successor that is pinned by "next" pointers that are accessible
         * independently during traversal. So instead we swap the tree
         * linkages. If the current tree appears to have too few nodes,
         * the bin is converted back to a plain bin. (The test triggers
         * somewhere between 2 and 6 nodes, depending on tree structure).
         */
//大致意思，就是我们在删除红黑树节点的时候，需要考虑linkhashmap的结构（next，prev节点）；同时需要考虑如果节点比较少的时候，进行tree与bin之间的转换
        final void removeTreeNode(HashMap<K,V> map, Node<K,V>[] tab,
                                  boolean movable) {
            int n;
            if (tab == null || (n = tab.length) == 0)
                return;
            int index = (n - 1) & hash;
//找到删除节点的所在的index；从根结点开始遍历，
            TreeNode<K,V> first = (TreeNode<K,V>)tab[index], root = first, rl;
//需要删除节点的 的 后继节点succ，前驱节点pred；
            TreeNode<K,V> succ = (TreeNode<K,V>)next, pred = prev;
//处理node作为linkhashmap时候，前驱与后继节点之间的关系；
            if (pred == null)
                tab[index] = first = succ;
            else
//  前驱的后继，等于该节点的后继；
                pred.next = succ;
            if (succ != null)
//  处理后继的前驱，为该节点的前驱；
                succ.prev = pred;
            if (first == null)
                return;
//处理完作为link的后继与前驱的关系；后面处理红黑树的关系；
            if (root.parent != null)
                root = root.root();
            if (root == null || root.right == null ||
                (rl = root.left) == null || rl.left == null) {
                tab[index] = first.untreeify(map);  // too small
//如果该节点节点太少，则转换成bin桶
                return;
            }
//如果节点满足红黑树的结构；继续遍历；replacement 标记需要移除的节点
            TreeNode<K,V> p = this, pl = left, pr = right, replacement;
//如果左右子树都不为空的情况；p移除之后，为了不破坏红黑树的节点，需要找到替换节点；
//替换节点有两种可能性，即左子树的最大，或者右子树的最小；
            if (pl != null && pr != null) {
                TreeNode<K,V> s = pr, sl;//p为右子树；
                while ((sl = s.left) != null) //先找到右子树的左子树，find successor
                    s = sl;
                boolean c = s.red; s.red = p.red; p.red = c; // swap colors p与s交换颜色；
                TreeNode<K,V> sr = s.right;//sr为s的右节点
                TreeNode<K,V> pp = p.parent;//pp为p的父节点
//注意p为移除节点，s为替换节点，s.value>p.value;
                if (s == pr) { // p was s's direct parent
//如果刚好p的右子树为s，直接将s与p节点进行交换（s为叶子节点，）
                    p.parent = s;
                    s.right = p;
                }
                else {
                    TreeNode<K,V> sp = s.parent;
                    if ((p.parent = sp) != null) {
//s为sp的左孩子，则s父亲的左孩子改成p
                        if (s == sp.left)
                            sp.left = p;
                        else
//？？？？为什么sp可能
                            sp.right = p;
                    }
//将p的右子树，设置成s的右子树，p右子树的父节点改成s
                    if ((s.right = pr) != null)
                        pr.parent = s;
                }
                p.left = null;
//s的右（左）孩子赋值给p的右孩子，s右孩子的父亲改成p；同理处理s的父亲以及p的父亲‘
                if ((p.right = sr) != null)
                    sr.parent = p;
                if ((s.left = pl) != null)
                    pl.parent = s;
                if ((s.parent = pp) == null)
                    root = s;
                else if (p == pp.left)
                    pp.left = s;
                else
                    pp.right = s;
//自此，p与s的节点交换完毕；
                if (sr != null)
                    replacement = sr;
                else
                    replacement = p;
            }
            else if (pl != null)
                replacement = pl;
            else if (pr != null)
                replacement = pr;
            else
                replacement = p;
//注意replacement对应的节点，有两种种情况是p != replacement
            if (replacement != p) {
                TreeNode<K,V> pp = replacement.parent = p.parent;
                if (pp == null)
                    root = replacement;
                else if (p == pp.left)
                    pp.left = replacement;
                else
                    pp.right = replacement;
                p.left = p.right = p.parent = null;
            }

            TreeNode<K,V> r = p.red ? root : balanceDeletion(root, replacement);

            if (replacement == p) {  // detach
                TreeNode<K,V> pp = p.parent;
                p.parent = null;
                if (pp != null) {
                    if (p == pp.left)
                        pp.left = null;
                    else if (p == pp.right)
                        pp.right = null;
                }
            }
            if (movable)
                moveRootToFront(tab, r);
        }
```
![红黑树节点替换.jpg](https://upload-images.jianshu.io/upload_images/5294752-303736583544a592.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 红黑树的旋转
####  旋转的条件
>- 即树的高度 必须满足 h<=log*2*(n+1) 否则需要旋转
>- 不符合上述红黑树性质的，都需要着色调整，或者旋转调整

  
###左旋
####
![image.png](https://upload-images.jianshu.io/upload_images/5294752-b7d1c0e75c549341.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
 /* ------------------------------------------------------------ */
        // Red-black tree methods, all adapted from CLR
    //左旋和右旋都不会涉及到节点颜色的变化，除非遇到根结点，输入参数是 树的根结点
     //以及旋转的节点 P
        static <K,V> TreeNode<K,V> rotateLeft(TreeNode<K,V> root,
                                              TreeNode<K,V> p) {
            TreeNode<K,V> r, pp, rl;
            //p节点不为空，且将p的右孩子赋值给r ，
            if (p != null && (r = p.right) != null) {
          //特别重要一： 取出原来右孩子的左孩子作为新p的右孩子；并赋值给rl；
                if ((rl = p.right = r.left) != null)
                //将rl的parent设置为p节点，与上一个形成呼应  
                    rl.parent = p;
        // 特点二 ： 转换父节点，将p的父节点，赋值给r的父节点；并赋值给pp
        //  如果pp节点为空，即r为root 节点，然后将新的根结点赋值给r，并且着色为黑色
                if ((pp = r.parent = p.parent) == null)
                    (root = r).red = false;
      //特点三： 如果p为父节点的左孩子，则pp的左孩子为新的节点r； 同理右孩子
                else if (pp.left == p)
                    pp.left = r;
                else
                    pp.right = r;
    //特点四： 新的节点r左孩子为p，并且p的父亲节点为新的节点r
                r.left = p;
                p.parent = r;
            }
            return root;
        }
````
同理 右旋；
###红黑树的插入
>- 每个插入的节点，默认为红色的节点；
````
static <K,V> TreeNode<K,V> balanceInsertion(TreeNode<K,V> root,
                                                    TreeNode<K,V> x) {
            //新加入的节点的着色为红色
            x.red = true;
            for (TreeNode<K,V> xp, xpp, xppl, xppr;;) {
            //第一种情况 如果新加节点的父节点为空，即root为空，刚加入的节点为root，着色为黑色，返回x
                if ((xp = x.parent) == null) {
                    x.red = false;
                    return x;
                }
          // 第二种情况 如果xp（x的父亲节点）的节点为黑色，或者x的祖父节点为空节点，返回该树
                else if (!xp.red || (xpp = xp.parent) == null)
                    return root;
        //第三种情况 如果父亲节点为红色，且祖父节点不为空的情况；且xp在xpp的左子树下；
                if (xp == (xppl = xpp.left)) {
                    //如果x的叔叔为右节点，且节点不为空，且为红色的情况，即和父亲的颜色一致，因为叔叔和父亲节点
                  //都为红色，则直接进行调整着色；叔叔和父亲节点改成黑色，祖父着色改成红色，
                //同时，x赋值给祖父，继续向上遍历
                    if ((xppr = xpp.right) != null && xppr.red) {
                        xppr.red = false;
                        xp.red = false;
                        xpp.red = true;
                        x = xpp;
                    }
                    else {
            //如果且xp在xpp的左子树下；但是x的叔叔节点为空的情况；
                        if (x == xp.right) {
          //x为xp的右子树，先左旋xp(即xp为上图二的4节点，进行左旋，左旋之后变成如图二的结构)
                            root = rotateLeft(root, x = xp);
        //重排xp，xpp,x之间的关系；从叶子节点开始依次为原来为xp-x-xpp改为x-xp-xpp；
                            xpp = (xp = x.parent) == null ? null : xp.parent;
                        }
        //注意此时的着色，x为红，xp为红，xpp为黑色；
                        if (xp != null) {
        //变化着色，xp修改为黑色；xpp为黑色，然后将整个左子树从xpp开始进行右旋，
                            xp.red = false;
                            if (xpp != null) {
                                xpp.red = true;
                                root = rotateRight(root, xpp);
                            }
                        }
                    }
                }
                else {
  //第三种情况 如果父亲节点为红色，且祖父节点不为空的情况；且xp在xpp的右子树的情况；
                    if (xppl != null && xppl.red) {
  //叔叔节点为红色，和父亲一个颜色，则调整颜色，将父亲和叔叔节点改成黑色，祖父节点为红色，
//继续向上遍历节点
                        xppl.red = false;
                        xp.red = false;
                        xpp.red = true;
                        x = xpp;
                    }
                    else {
    //  叔叔节点为空的情况，
                        if (x == xp.left) {
    //x为xp的左节点，先将x进行右旋，同理重构x，xp，xpp之间 的关系
                            root = rotateRight(root, x = xp);
                            xpp = (xp = x.parent) == null ? null : xp.parent;
                        }
  //将整个右子树进行左旋；
                        if (xp != null) {
                            xp.red = false;
                            if (xpp != null) {
                                xpp.red = true;
                                root = rotateLeft(root, xpp);
                            }
                        }
                    }
                }
            }
        }
`````
> 特别强调以下几点
>- 新加入的节点，默认着色为红色
>- 如果xp为黑色的话，则不需要做任何操作

####hashmap红黑树源码的一些体会；
>- 红黑树是一种二叉查找树的特例，满足二叉查找树的基本性质；
>- swap节点，注意孩子赋予新的父亲，则父亲也拥有了新的左右孩子
>- balanceInsertion以及balanceDeletion，都是对红黑树局部优化（可认为仅涉及其三层结构，即爷爷的左右孩子->叔叔节点）
>- 同一个桶内，是 index=hash & length-1 相同，并不是hash值相同；
>- hashmap的红黑树，其实保留了linkhashmap的特性，即保留了next，prev节点，在删除以及增加红黑树节点的时候，注意linkhashmap，前驱和后继节点的处理；
>- 找到同一个值的要求是；ph = hash&(p.key == key || key !=null key.equals.p,key)，这里有一个条件就是允许，key的值null，但是仅有一个null值的key；


参考地址：https://blog.csdn.net/troy_kfrozen/article/details/78906022
https://www.jianshu.com/p/eb79b0ceb62c



