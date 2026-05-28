const Skeleton = ({
  type = "card",
  count = 1,
}) => {
  /*
  |--------------------------------------------------------------------------
  | PROFILE SKELETON
  |--------------------------------------------------------------------------
  */

  if (type === "profile") {
    return (
      <div
        className="
          animate-pulseSoft
          rounded-3xl
          border
          border-muted
          bg-white
          p-6
          shadow-card
        "
      >
        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* AVATAR */}

            <div
              className="
                h-32
                w-32
                rounded-3xl
                bg-muted-soft
              "
            />

            {/* TEXT */}

            <div className="flex flex-col gap-4">
              <div
                className="
                  h-10
                  w-64
                  rounded-xl
                  bg-muted-soft
                "
              />

              <div
                className="
                  h-5
                  w-80
                  rounded-xl
                  bg-muted-soft
                "
              />

              {/* STATS */}

              <div className="flex gap-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="
                      h-20
                      w-32
                      rounded-2xl
                      bg-muted-soft
                    "
                  />
                ))}
              </div>
            </div>
          </div>

          {/* BUTTON */}

          <div
            className="
              h-12
              w-40
              rounded-2xl
              bg-muted-soft
            "
          />
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | POSTS SKELETON
  |--------------------------------------------------------------------------
  */

  if (type === "posts") {
    return (
      <div
        className="
          grid
          grid-cols-1
          gap-6
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {Array.from({ length: count }).map(
          (_, index) => (
            <div
              key={index}
              className="
                animate-pulseSoft
                overflow-hidden
                rounded-3xl
                border
                border-muted
                bg-white
              "
            >
              <div
                className="
                  h-72
                  w-full
                  bg-muted-soft
                "
              />

              <div className="flex flex-col gap-4 p-5">
                <div
                  className="
                    h-6
                    w-40
                    rounded-lg
                    bg-muted-soft
                  "
                />

                <div
                  className="
                    h-4
                    w-full
                    rounded-lg
                    bg-muted-soft
                  "
                />

                <div
                  className="
                    h-4
                    w-5/6
                    rounded-lg
                    bg-muted-soft
                  "
                />
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  return null;
};

export default Skeleton;