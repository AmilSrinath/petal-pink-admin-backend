create table if not exists petal_pink_user_tb
(
    user_id           varchar(10)  not null
        primary key,
    employee_id       varchar(30)  null,
    email             varchar(50)  null,
    password          varchar(30)  null,
    role              varchar(12)  null,
    status            int          null,
    visible           int          null,
    image_url         mediumtext   null,
    name              varchar(100) null,
    nic               varchar(100) null,
    reset_code        varchar(100) null,
    reset_code_expiry varchar(100) null
);

create table if not exists petal_pink_configuration_tb
(
    config_id    int auto_increment
        primary key,
    config_name  varchar(200) null,
    config_value varchar(200) null,
    user_id      varchar(10)  null,
    created_date datetime     null,
    status       int          null,
    constraint petal_pink_configuration_user_fk
        foreign key (user_id) references petal_pink_user_tb (user_id)
);

create table if not exists petal_pink_product_tb
(
    product_id    int auto_increment
        primary key,
    product_name  varchar(200) null,
    unit_type     varchar(5)   null,
    product_price double       null,
    quantity      int          null,
    discount      double       null,
    status        int          null,
    visible       int          null,
    create_date   varchar(30)  null,
    edit_date     varchar(30)  null,
    image_url     mediumtext   not null,
    user_id       varchar(10)  null,
    image_url_2   mediumtext   null,
    image_url_3   mediumtext   null,
    weight        double       null,
    description   text         null,
    keyPoints     text         null,
    faq           text         null,
    howToUse      text         null,
    constraint petal_pink_product_petal_pink_user_tb__fk
        foreign key (user_id) references petal_pink_user_tb (user_id)
);

