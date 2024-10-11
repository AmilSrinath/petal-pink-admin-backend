create table if not exists petal_pink_customer_tb
(
    cus_id       int auto_increment
        primary key,
    first_name   varchar(200) not null,
    last_name    varchar(200) not null,
    address      varchar(200) null,
    city         varchar(200) null,
    email        varchar(100) not null,
    phone_1      varchar(12)  not null,
    phone_2      varchar(12)  null,
    province     varchar(200) null,
    suite        varchar(200) null,
    country      varchar(200) null,
    created_date datetime     null,
    status       int          null
);

create table if not exists petal_pink_order_tb
(
    order_id     int auto_increment
        primary key,
    cus_id       int         null,
    created_date datetime    null,
    payment      varchar(30) null,
    total        double      null,
    status       int         null,
    constraint petal_pink_order_tb_petal_pink_customer_tb_cus_id_fk
        foreign key (cus_id) references petal_pink_customer_tb (cus_id)
);

create table if not exists petal_pink_order_details_tb
(
    order_details_id int auto_increment
        primary key,
    order_id         int          null,
    quantity         int          null,
    product_name     varchar(250) null,
    price            double       null,
    sub_total        double       null,
    created_date     datetime     null,
    status           int          null,
    constraint petal_pink_order_details_tb_petal_pink_order_tb_order_id_fk
        foreign key (order_id) references petal_pink_order_tb (order_id)
);

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