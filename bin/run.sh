#!/bin/bash

# service compose files
declare -g -r -A SERVICE_COMPOSE_FILE_MAP=(
    ['elasticsearch']='elastic-stack/docker-compose-es.yml'
    ['zipkin']='zipkin/docker-compose.yml'
    ['mongodb']='mongodb/docker-compose.yml'
    ['rabbitmq']='rabbitmq/docker-compose.yml'
    ['config']='config/docker-compose.yml'
    ['registry']='registry/docker-compose.yml'
    ['gateway']='gateway/docker-compose.yml'
    ['account-service']='account-service/docker-compose.yml'
    ['auth-service']='auth-service/docker-compose.yml'
    ['notification-service']='notification-service/docker-compose.yml'
    ['statistics-service']='statistics-service/docker-compose.yml'
    ['turbine-stream-service']='turbine-stream-service/docker-compose.yml'
    ['monitoring']='monitoring/docker-compose.yml'
)

# serivce with dependencies
declare -g -r -A DEPENDED_SERVICE=(
    ['zipkin-apm']='zipkin elasticsearch rabbitmq'
)

function main()
{
    declare root_dir="$(dirname $0)/../"
    cd $root_dir

    declare -a services
    declare -a excludes
    declare custom_config
    declare -i validate_config=0
    declare -i down_cmd=0
    while getopts "s:e:c:vdh" opt
    do
        case ${opt} in
            s)
                getServices "$OPTARG" services
                ;;
            e)
                getServices "$OPTARG" excludes
                ;;
            c)
                custom_config="$OPTARG"
                ;;
            v)
                validate_config=1
                ;;
            d)
                down_cmd=1
                ;;
            h)
                usage
                ;;
            *)
                usage
                ;;
        esac
    done

    if [ ${#services[@]} == 0 ]; then
        # foreach key of associative array
        for s in "${!SERVICE_COMPOSE_FILE_MAP[@]}"; do
            services[${#services[@]}]=$s
        done
    fi

    if [ ${#excludes[@]} != 0 ]; then
        declare -a filtered
        declare -i i
        declare exclude_string=${excludes[*]}
        for (( i=0; i < ${#services[@]}; i++  ))
        do
            # search contains substring
        declare service=${services[$i]}
        if [ -n "${exclude_string##*$service*}" ]; then
            filtered[${#filtered[@]}]=$service
        fi
        done

        unset services
        services=${filtered[@]}
    fi

    declare docker_compose_files
    declare docker_compose_cmd="docker-compose --env-file ./.env"
    docker_compose_files="-f ./docker-compose-base.yml"
    for s in ${services[@]} ; do
        docker_compose_files="$docker_compose_files -f ${SERVICE_COMPOSE_FILE_MAP[$s]}"
    done

    if [ -n "$custom_config" ]; then
        docker_compose_files="$docker_compose_files -f $custom_config"
    fi

    if [ $validate_config == 1 ]; then
        $docker_compose_cmd $docker_compose_files config
        exit 0
    fi

    if [ $down_cmd == 1 ]; then
        $docker_compose_cmd $docker_compose_files down
        exit 0
    fi

    echo "Use following command to stop:"
    echo "docker-compose $docker_compose_files down"

    $docker_compose_cmd $docker_compose_files up -d --build
}

function usage()
{
    echo <<EOF
run this app with docker-compose.
    Options
        -s SERVICE_LIST run specified SERVICE_LIST
        -e EXCLUDE_LIST run services without EXCLUDE_LIST
        -c FILE add a custom docker compose config file
        -v validate config with docker-compose config
        -d run docker-compose down command
        -h display this message
EOF

    exit 0
}

function getServices()
{
    declare -n servicesRef=$2
    declare -a candidates

    for s in $1 ; do
        # check depended services first
        if [ -n "${DEPENDED_SERVICE[$s]}" ]; then
            for ss in ${DEPENDED_SERVICE[$s]} ; do
                candidates[${#candidates[@]}]=$ss
            done
        elif [ -n "${SERVICE_COMPOSE_FILE_MAP[$s]}" ]; then
            candidates[${#candidates[@]}]=$s
        else
            echo "unknown service: $s"
            exit 1
        fi
    done


    for ss in $(printf "%s\n" "${candidates[@]}" | sort -u) ; do
        servicesRef[${#servicesRef[@]}]=$ss
    done
}


# quote is required for getotps to get parameter in quotes correctly
main "$@"
