import {
  memo,
  useMemo,
  useEffect,
  useState,
  useDeferredValue,
  useRef,
} from "react";
import {
  List as VirtualList,
  WindowScroller,
  CellMeasurerCache,
  CellMeasurer,
} from "react-virtualized";

const API_CONFIG = {
  USERS: "https://dummyjson.com/users?limit=200",
  PRODUCTS: "https://dummyjson.com/products?limit=200",
};

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 180,
  minHeight: 120,
});

const ProductCard = memo(({ product, liked, onToggleLike, onImageLoad }) => {
  return (
    <li className="card">
      <LazyImage src={product.image} alt={product.title} onLoad={onImageLoad} />
      <div className="card-content">
        <h3>
          {product.id}. {product.title}
        </h3>
        <p>{product.description}</p>
        <div className="card-footer">
          <span className="user-badge">{product.userName}</span>
          <button
            onClick={() => onToggleLike(product.id)}
            className={liked ? "liked" : ""}
          >
            {liked ? "❤️ Liked" : "🤍 Like"}
          </button>
        </div>
      </div>
    </li>
  );
});

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [likedProducts, setLikedProducts] = useState(new Set());

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, usersRes] = await Promise.all([
          fetch(API_CONFIG.PRODUCTS),
          fetch(API_CONFIG.USERS),
        ]);

        if (!usersRes.ok || !productsRes.ok)
          throw new Error("HTTP error while fetching data");

        const productsData = await productsRes.json();
        const usersData = await usersRes.json();

        const usersMap = usersData?.users?.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});

        const combined = productsData?.products?.map((product) => {
          const matchedUser = usersMap[product.id];

          return {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            rating: product.rating,
            brand: product.brand,
            category: product.category,
            image: product.images?.[0],
            userName: matchedUser
              ? `${matchedUser.firstName} ${matchedUser.lastName}`
              : "Unknown User",
          };
        });

        setProducts(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!deferredSearch.trim()) return products;

    const term = deferredSearch.toLowerCase();
    return products.filter((product) => {
      return (
        product.title?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.userName?.toLowerCase().includes(term)
      );
    });
  }, [deferredSearch, products]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const toggleLike = (productId) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Products Catalog</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {filteredProducts?.length === 0 ? (
        <div className="no-results">
          <p>No products found for "{search}"</p>
        </div>
      ) : (
        <WindowScroller>
          {({ height, isScrolling, onChildScroll, scrollTop }) => (
            <VirtualList
              autoHeight={true}
              height={height}
              width={600}
              rowCount={filteredProducts.length}
              rowHeight={cache.rowHeight}
              deferredMeasurementCache={cache}
              overscanRowCount={3}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
              rowRenderer={({ index, key, style, parent }) => {
                const product = filteredProducts[index];
                return (
                  <CellMeasurer
                    key={key}
                    cache={cache}
                    parent={parent}
                    columnIndex={0}
                    rowIndex={index}
                  >
                    {({ measure, registerChild }) => (
                      <div ref={registerChild} style={style}>
                        <ProductCard
                          product={product}
                          liked={likedProducts.has(product.id)}
                          onToggleLike={toggleLike}
                          onImageLoad={measure}
                        />
                      </div>
                    )}
                  </CellMeasurer>
                );
              }}
            />
          )}
        </WindowScroller>
      )}
    </div>
  );
}

const LazyImage = ({ src, alt, onLoad }) => {
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = imgRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "10px" } // preload before fully visible
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ minHeight: 80 }}>
      {visible ? (
        <img src={src} alt={alt} onLoad={onLoad} style={{ width: 100 }} />
      ) : (
        <div
          style={{
            height: 100,
            width: 100,
            background: "#cecece",
          }}
        />
      )}
    </div>
  );
};
